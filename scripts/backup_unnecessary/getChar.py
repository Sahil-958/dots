import sys
from fontTools.ttLib import TTFont

def extract_chars_and_classes(ttf_file):
    font = TTFont(ttf_file)

    chars_and_classes = []

    for table in font['cmap'].tables:
        if table.isUnicode():
            for k, v in table.cmap.items():
                chars_and_classes.append((chr(k), v))

    return chars_and_classes

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <filename>")
        return
    
    ttf_file = sys.argv[1]
    chars_and_classes = extract_chars_and_classes(ttf_file)

    for char, class_value in chars_and_classes:
        print(f"{char}   {class_value}")

if __name__ == "__main__":
    main()

