#!/usr/bin/env bash
cd $(npm root) && cd ../icons/

svg_file_name="cashcash-color.svg"
ico_file_name="icon.ico"
echo "Convert ${svg_file_name} to ${ico_file_name}"
# Need imagemagik
convert -density 384 -background none ${svg_file_name} -define icon:auto-resize ${ico_file_name}

for FILE in `ls ./icon.iconset | sort`; do
    # if file contains upper case
    if [[ ${FILE} =~ [[:upper:]] ]]; then
        new_name="$(echo ${FILE} | tr '[:upper:]' '[:lower:]')"
        echo "Moving $FILE to ${new_name}"
        mv "./icon.iconset/${FILE}" "./icon.iconset/${new_name}"
    fi
done

echo "Convert icon.iconset to icon.icns"
iconutil -c icns -o ./icon.icns ./icon.iconset

working_dir=$(pwd)
png_file_name="256x256.png"
echo "Convert ${svg_file_name} to ${png_file_name}"
# Need inkscape
/opt/local/bin/inkscape -z -e ${working_dir}/${png_file_name} -w 256 -h 256 ${working_dir}/${svg_file_name}
