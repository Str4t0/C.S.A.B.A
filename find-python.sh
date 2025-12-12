#!/bin/bash

# Python kereső script
# Segít megtalálni a Python 3 telepítését, ha nincs a PATH-ban

echo "🔍 Python 3 keresése..."
echo ""

# 1. PATH-ban keresés
echo "1. PATH-ban keresés:"
if command -v python3 &> /dev/null; then
    PYTHON_PATH=$(which python3)
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo "   ✅ Találat: $PYTHON_PATH"
    echo "   Verzió: $PYTHON_VERSION"
    exit 0
fi

if command -v python &> /dev/null; then
    PYTHON_VERSION_CHECK=$(python --version 2>&1 | grep -oP 'Python \K[0-9]+' | head -1)
    if [ "$PYTHON_VERSION_CHECK" -ge 3 ] 2>/dev/null; then
        PYTHON_PATH=$(which python)
        PYTHON_VERSION=$(python --version 2>&1)
        echo "   ✅ Találat: $PYTHON_PATH"
        echo "   Verzió: $PYTHON_VERSION"
        exit 0
    fi
fi
echo "   ❌ Nem található a PATH-ban"
echo ""

# 2. Gyakori helyeken keresés
echo "2. Gyakori helyeken keresés:"
COMMON_PATHS=(
    "/usr/bin/python3"
    "/usr/local/bin/python3"
    "/opt/bin/python3"
    "/usr/bin/python"
    "/usr/local/bin/python"
    "/opt/bin/python"
    "/bin/python3"
    "/bin/python"
)

FOUND=0
for PYTHON_PATH in "${COMMON_PATHS[@]}"; do
    if [ -f "$PYTHON_PATH" ] && [ -x "$PYTHON_PATH" ]; then
        PYTHON_VERSION_CHECK=$($PYTHON_PATH --version 2>&1 | grep -oP 'Python \K[0-9]+' | head -1)
        if [ "$PYTHON_VERSION_CHECK" -ge 3 ] 2>/dev/null; then
            PYTHON_VERSION=$($PYTHON_PATH --version 2>&1)
            echo "   ✅ Találat: $PYTHON_PATH"
            echo "   Verzió: $PYTHON_VERSION"
            FOUND=1
            break
        fi
    fi
done

if [ $FOUND -eq 1 ]; then
    exit 0
fi
echo "   ❌ Nem található a gyakori helyeken"
echo ""

# 3. find parancs használata (ha van)
echo "3. Rendszeres keresés (find parancs):"
if command -v find &> /dev/null; then
    echo "   Keresés folyamatban (ez eltarthat néhány percig)..."
    PYTHON_FOUND=$(find /usr /opt /bin -name "python3" -type f -executable 2>/dev/null | head -1)
    
    if [ ! -z "$PYTHON_FOUND" ]; then
        PYTHON_VERSION=$($PYTHON_FOUND --version 2>&1)
        echo "   ✅ Találat: $PYTHON_FOUND"
        echo "   Verzió: $PYTHON_VERSION"
        exit 0
    fi
    echo "   ❌ Nem található"
else
    echo "   ⚠️  find parancs nem elérhető"
fi
echo ""

# 4. QNAP specifikus helyek
echo "4. QNAP specifikus helyek keresése:"
QNAP_PATHS=(
    "/share/CACHEDEV1_DATA/.qpkg/Python3/bin/python3"
    "/share/CACHEDEV1_DATA/.qpkg/Python/bin/python3"
    "/opt/bin/python3"
    "/usr/local/bin/python3"
)

for PYTHON_PATH in "${QNAP_PATHS[@]}"; do
    if [ -f "$PYTHON_PATH" ] && [ -x "$PYTHON_PATH" ]; then
        PYTHON_VERSION_CHECK=$($PYTHON_PATH --version 2>&1 | grep -oP 'Python \K[0-9]+' | head -1)
        if [ "$PYTHON_VERSION_CHECK" -ge 3 ] 2>/dev/null; then
            PYTHON_VERSION=$($PYTHON_PATH --version 2>&1)
            echo "   ✅ Találat: $PYTHON_PATH"
            echo "   Verzió: $PYTHON_VERSION"
            exit 0
        fi
    fi
done
echo "   ❌ Nem található QNAP specifikus helyeken"
echo ""

echo "❌ Python 3 nem található automatikusan!"
echo ""
echo "Kérlek add meg manuálisan a Python 3 elérési útját."
echo "Használd a következő parancsot a kereséshez:"
echo "  find / -name python3 -type f 2>/dev/null"
echo ""
echo "Vagy kérdezd meg a rendszergazdát a Python telepítési helyéről."

