"""Crée les icônes BIBILEARN (PNG) sans aucune bibliothèque externe."""
import os, struct, zlib

def png(path, n):
    s = n / 120.0
    def ell(x, y, cx, cy, rx, ry):
        return ((x - cx * s) / (rx * s)) ** 2 + ((y - cy * s) / (ry * s)) ** 2 <= 1
    rows = []
    for y in range(n):
        row = bytearray([0])
        for x in range(n):
            c = (233, 221, 255)                                   # fond lilas
            if ell(x, y, 60, 68, 44, 42): c = (201, 182, 245)    # corps
            if ell(x, y, 60, 75, 30, 26): c = (255, 243, 196)    # ventre
            for cx in (44, 76):
                if ell(x, y, cx, 54, 12, 12): c = (255, 255, 255)
                if ell(x, y, cx + 2, 56, 6, 6): c = (45, 42, 74)
            for cx in (34, 86):
                if ell(x, y, cx, 70, 5, 5): c = (255, 179, 199)  # joues
            if ell(x, y, 60, 76, 8, 5) and y > 76 * s: c = (45, 42, 74)  # sourire
            row += bytes(c)
        rows.append(bytes(row))
    raw = zlib.compress(b"".join(rows), 9)
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", n, n, 8, 2, 0, 0, 0)) + chunk(b"IDAT", raw) + chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "wb").write(data)

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
png(os.path.join(root, "www", "icons", "icon-192.png"), 192)
png(os.path.join(root, "www", "icons", "icon-512.png"), 512)
png(os.path.join(root, "build", "icon.png"), 512)
print("icônes créées")
