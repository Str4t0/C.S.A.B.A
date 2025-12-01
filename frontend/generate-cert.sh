#!/bin/bash
# Self-signed SSL tanúsítvány generálása fejlesztéshez

echo "🔐 SSL tanúsítvány generálása..."

# IP cím automatikus detektálása (Windows)
LOCAL_IP=$(ipconfig | grep -i "IPv4" | head -1 | awk '{print $NF}' | tr -d '\r')

# Ha nem található, használjuk az alapértelmezettet
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="192.168.50.75"
    echo "⚠️  IP cím nem található, használom: $LOCAL_IP"
else
    echo "Helyi IP cím: $LOCAL_IP"
fi

# Könyvtár létrehozása
mkdir -p certs

# Self-signed tanúsítvány generálása (10 évig érvényes)
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -days 3650 \
  -subj "/C=HU/ST=Hungary/L=Budapest/O=Home Inventory/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:$LOCAL_IP"

echo "✅ Tanúsítvány létrehozva: certs/cert.pem"
echo "✅ Kulcs létrehozva: certs/key.pem"
echo ""
echo "⚠️  FIGYELEM: Self-signed tanúsítvány! A böngésző figyelmeztetést fog mutatni."
echo "   Kattints a 'Tovább a webhelyre' gombra a böngészőben."

