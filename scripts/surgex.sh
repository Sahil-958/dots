#!/bin/sh

# Define the usage message
usage() {
  echo "Usage: $0 -M "pattern" -R "pattern" -F "file_path""
  echo "Options:"
  echo "  -M  Specify Pattern to Match"
  echo "  -R  Specify Pattern whose matches going to be removed from matches matched by -M flag pattern"
  echo "  -F  Specify file on which operation is Performed"
  exit 1
}


while [[ $# -gt 0 ]]
do
        case ${1} in
                -h|--help)
                        usage
                ;;
                -m|--match)
                        MATCH="${2}"
                        shift
                ;;
                -r|--remove)
                        REMOVE="$2"
                        shift
                        ;;
                -f|--file)
                        FILE="${2}"
                        shift
                ;;
                *)
                                echo "unknown option ${1}"
                                usage;
                ;;
        esac
        shift
done
echo "results $MATCH $FILE $REMOVE"
matches=$(grep -ioP "$MATCH" "$FILE")
IFS=$'\n'
for match in $matches
do
    updated=$(echo $match |sed -r "s/$REMOVE//")
    echo "$match ->$updated"
done


while true; do
echo "Do you want to apply these Changes to the file? (y/b/n/h)"
read answer

case "$answer" in
  y|Y)
    echo -n "Processing in 3.."
    sleep 1
    echo -n "2.."
    sleep 1
    echo -n "1"
    sleep 1
    for match in $matches
    do
        updated=$(echo $match |sed -r "s/$REMOVE//")
        sed -ri "s/$match/$updated/g" "$FILE"
    done
    echo "Done Processing"
    exit 1
    ;;
  b|B)
    echo -n "Processing in 3.."
    sleep 1
    echo -n "2.."
    sleep 1
    echo -n "1"
    sleep 1
    cp $FILE $FILE.bak
    for match in $matches
    do
        updated=$(echo $match |sed -r "s/$REMOVE//")
        sed -ri "s/$match/$updated/g" "$FILE"
    done
    echo "Done Processing."
    exit 1
    ;;
  n|N)
    echo "Okay, not processing anything."
    exit 1
    ;;
  *)
    # Handle invalid input
    echo "Enter Y or y to make changes to original file"
    echo "Enter B or b to make backup and then apply changes to original file"
    echo "Enter n or N to exit" 
    ;;
esac
done
