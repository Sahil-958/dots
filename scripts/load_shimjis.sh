#!/usr/bin/env bash
export LD_LIBRARY_PATH=/usr/lib/jvm/java-8-openjdk/lib/amd64:$LD_LIBRARY_PATH

if [ -h ~/dots/shimjis/conf ]; then
    echo "Removing old conf symlink"
    rm ~/dots/shimjis/conf
fi

if [ -h ~/dots/shimjis/img ]; then
    echo "Removing old img symlink"
    rm ~/dots/shimjis/img
fi

if [ "$1" = "" ]
then
	echo "No Shimeji specified, loading random Shimeji"
    shimjis=$(ls -1 ~/dots/shimjis/Shimejis)
    randomShimeji=$(echo "$shimjis" | shuf -n 1)
    ln -s ~/dots/shimjis/Shimejis/"$randomShimeji"/conf ~/dots/shimjis/conf
    ln -s ~/dots/shimjis/Shimejis/"$randomShimeji"/img ~/dots/shimjis/img
    echo "Loaded $randomShimeji Shimeji"
elif [ "$1" = "default" ]
then
	echo "No Shimeji specified, loading default Shimeji"
	ln -s  ~/dots/shimjis/Shimejis/default/conf ~/dots/shimjis/conf
	ln -s  ~/dots/shimjis/Shimejis/default/img ~/dots/shimjis/img
else
	if cd "Shimejis/$1"; then
		echo "Loading $1 Shimeji"
		cd ../..
		ln -s  ~/dots/shimjis/Shimejis/"$1"/conf ~/dots/shimjis/conf
		ln -s  ~/dots/shimjis/Shimejis/"$1"/img ~/dots/shimjis/img
	else
		echo "Couldn't find Shimeji $1, loading default Shimeji"
		ln -s  ~/dots/shimjis/Shimejis/default/conf ~/dots/shimjis/conf
		ln -s  ~/dots/shimjis/Shimejis/default/img ~/dots/shimjis/img
	fi
fi

java -classpath ~/dots/shimjis/Shimeji.jar -Xmx1000m com.group_finity.mascot.Main -Djava.util.logging.config.file=~/dots/shimjis/conf/logging.properties
