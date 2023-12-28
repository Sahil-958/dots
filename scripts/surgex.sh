#i found out that the below thing isn't needed anymore as vim can do that with regx i thought that can't be done with vim that's why in the frist place i tired to make something like below but as now i know how to do that in vim ( check vim regx manual page for info how to do that ) i no longer need this script but keeping it as i might help as a template when i need to rename or do any other things with regx. As i love the name i chosen for it Surgex or sergex;  Surgex - Super Regx and sounds fun, looks nice that's all i need to keep this in my repo LOL. And if you are reading this you are probably procastinating so i would suggest you to finish your work :)
#!/bin/sh

# Define the usage message
usage() {
  echo "Usage: $0 -m "pattern" -r "pattern" -f "file_path" -s "Substitution String Here" "
  echo "Options marked with * are required."
  echo "Options:"
  echo "*  -m  Specify Pattern to Match"
  echo "*  -r  Specify Pattern whose matches going to be substituted with -s string from matches matched by -M flag pattern"
  echo "*  -f  Specify file on which operation is Performed"
  echo "   -s  Specify the substitution string that will be inserted in place of remove pattern result;Default value is empty string"
  exit 1
}
SUBSTITUTE=""

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
                        REMOVE="${2}"
                        shift
                        ;;
                -f|--file)
                        FILE="${2}"
                        shift
                ;;
                -s|--substitute)
                        SUBSTITUTE="${2}"
                        shift
                ;;
                *)
                                echo "unknown option ${1}"
                                usage;
                ;;
        esac
        shift
done

if [ -z "$FILE" ] || [ -z "$REMOVE" ] || [ -z "$MATCH" ]; then
usage
exit 1
fi

echo -e "MATCH_PATTERN:$MATCH \n FILE_PATH:$FILE\nREMOVE PATTERN: $REMOVE\nSUBSTITUTE_STRING:$SUBSTITUTE"
matches=$(grep -ioP "$MATCH" "$FILE")
IFS=$'\n'
for match in $matches
do
    updated=$(echo $match |sed -r "s/$REMOVE/$SUBSTITUTE/")
    echo "$match -> $updated"
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
        updated=$(echo $match |sed -r "s/$REMOVE/$SUBSTITUTE/")
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
        updated=$(echo $match |sed -r "s/$REMOVE/$SUBSTITUTE/")
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
