"""Length of an SVG path, in user units.

Needed so every pointer in the set moves at the SAME speed. Travel time is
length divided by one shared constant, so a long connector takes proportionally
longer and two pointers on different lines visibly keep pace. Timing them by
hand is what made the motion look uncoordinated.

Only the commands the illustrations actually use are implemented: M L H V C S Q
A Z, absolute and relative. Anything else raises rather than silently returning
a wrong length, because a wrong length here is a pointer moving at the wrong
speed, which is hard to spot and easy to ship.
"""
import math
import re

_TOKEN = re.compile(r"([MmLlHhVvCcSsQqAaZz])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)")


def _tokens(d):
    for cmd, num in _TOKEN.findall(d):
        yield cmd if cmd else float(num)


def _cubic_len(p0, p1, p2, p3, steps=24):
    def at(t):
        u = 1 - t
        return (u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
                u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1])
    prev, total = at(0), 0.0
    for i in range(1, steps + 1):
        cur = at(i / steps)
        total += math.hypot(cur[0] - prev[0], cur[1] - prev[1])
        prev = cur
    return total


def _arc_len(p0, rx, ry, rot, large, sweep, p1, steps=24):
    """Endpoint parameterisation to centre parameterisation, then sample."""
    if rx == 0 or ry == 0 or p0 == p1:
        return math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    rx, ry = abs(rx), abs(ry)
    phi = math.radians(rot)
    dx2, dy2 = (p0[0] - p1[0]) / 2, (p0[1] - p1[1]) / 2
    x1 = math.cos(phi) * dx2 + math.sin(phi) * dy2
    y1 = -math.sin(phi) * dx2 + math.cos(phi) * dy2
    lam = x1 * x1 / (rx * rx) + y1 * y1 / (ry * ry)
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1
    den = rx * rx * y1 * y1 + ry * ry * x1 * x1
    co = math.sqrt(max(0.0, num / den)) * (-1 if large == sweep else 1)
    cx1, cy1 = co * rx * y1 / ry, -co * ry * x1 / rx
    cx = math.cos(phi) * cx1 - math.sin(phi) * cy1 + (p0[0] + p1[0]) / 2
    cy = math.sin(phi) * cx1 + math.cos(phi) * cy1 + (p0[1] + p1[1]) / 2

    def ang(ux, uy, vx, vy):
        d = (math.hypot(ux, uy) * math.hypot(vx, vy)) or 1e-9
        a = math.acos(max(-1.0, min(1.0, (ux * vx + uy * vy) / d)))
        return -a if ux * vy - uy * vx < 0 else a

    th0 = ang(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry)
    dth = ang((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry)
    if not sweep and dth > 0:
        dth -= 2 * math.pi
    elif sweep and dth < 0:
        dth += 2 * math.pi

    def at(t):
        th = th0 + dth * t
        return (cx + math.cos(phi) * rx * math.cos(th) - math.sin(phi) * ry * math.sin(th),
                cy + math.sin(phi) * rx * math.cos(th) + math.cos(phi) * ry * math.sin(th))
    prev, total = at(0), 0.0
    for i in range(1, steps + 1):
        cur = at(i / steps)
        total += math.hypot(cur[0] - prev[0], cur[1] - prev[1])
        prev = cur
    return total


def path_length(d):
    t = list(_tokens(d))
    i, total = 0, 0.0
    cur = start = (0.0, 0.0)
    prev_ctrl = None
    cmd = None
    while i < len(t):
        if isinstance(t[i], str):
            cmd = t[i]
            i += 1
            if cmd in "Zz":
                total += math.hypot(start[0] - cur[0], start[1] - cur[1])
                cur = start
                continue
        elif cmd is None:
            raise ValueError(f"path starts with a number: {d[:40]}")
        elif cmd == "M":
            cmd = "L"
        elif cmd == "m":
            cmd = "l"

        rel = cmd.islower()
        c = cmd.upper()

        def take(n):
            nonlocal i
            vals = t[i:i + n]
            if len(vals) != n or any(isinstance(v, str) for v in vals):
                raise ValueError(f"malformed '{cmd}' in path: {d[:60]}")
            i += n
            return vals

        if c == "M":
            x, y = take(2)
            cur = (cur[0] + x, cur[1] + y) if rel else (x, y)
            start = cur
        elif c in "LT":
            x, y = take(2)
            nxt = (cur[0] + x, cur[1] + y) if rel else (x, y)
            total += math.hypot(nxt[0] - cur[0], nxt[1] - cur[1])
            cur = nxt
        elif c == "H":
            (x,) = take(1)
            nxt = (cur[0] + x, cur[1]) if rel else (x, cur[1])
            total += abs(nxt[0] - cur[0])
            cur = nxt
        elif c == "V":
            (y,) = take(1)
            nxt = (cur[0], cur[1] + y) if rel else (cur[0], y)
            total += abs(nxt[1] - cur[1])
            cur = nxt
        elif c == "C":
            x1, y1, x2, y2, x, y = take(6)
            p1 = (cur[0] + x1, cur[1] + y1) if rel else (x1, y1)
            p2 = (cur[0] + x2, cur[1] + y2) if rel else (x2, y2)
            p3 = (cur[0] + x, cur[1] + y) if rel else (x, y)
            total += _cubic_len(cur, p1, p2, p3)
            prev_ctrl, cur = p2, p3
        elif c == "S":
            x2, y2, x, y = take(4)
            p1 = (2 * cur[0] - prev_ctrl[0], 2 * cur[1] - prev_ctrl[1]) if prev_ctrl else cur
            p2 = (cur[0] + x2, cur[1] + y2) if rel else (x2, y2)
            p3 = (cur[0] + x, cur[1] + y) if rel else (x, y)
            total += _cubic_len(cur, p1, p2, p3)
            prev_ctrl, cur = p2, p3
        elif c == "Q":
            x1, y1, x, y = take(4)
            q = (cur[0] + x1, cur[1] + y1) if rel else (x1, y1)
            p3 = (cur[0] + x, cur[1] + y) if rel else (x, y)
            p1 = (cur[0] + 2 / 3 * (q[0] - cur[0]), cur[1] + 2 / 3 * (q[1] - cur[1]))
            p2 = (p3[0] + 2 / 3 * (q[0] - p3[0]), p3[1] + 2 / 3 * (q[1] - p3[1]))
            total += _cubic_len(cur, p1, p2, p3)
            cur = p3
        elif c == "A":
            rx, ry, rot, large, sweep, x, y = take(7)
            p1 = (cur[0] + x, cur[1] + y) if rel else (x, y)
            total += _arc_len(cur, rx, ry, rot, int(large), int(sweep), p1)
            cur = p1
        else:
            raise ValueError(f"unsupported path command '{cmd}' in: {d[:60]}")
        if c not in "CS":
            prev_ctrl = None
    return total
