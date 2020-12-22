#!/bin/bash

CURRENT_PATH="$( cd "$(dirname "$0")/.." ; pwd -P )"

echo $CURRENT_PATH
# Name of your app.
APP="Cashcash"

APP_STORE_USERNAME="samuel.gagnepain@gmail.com"
# The path to the location you want to put the signed package.
IPA_PATH="$CURRENT_PATH/dist_electron_pro/$APP.pkg"

echo "Validating the app..."
xcrun altool --validate-app --file "$IPA_PATH" --username "$APP_STORE_USERNAME" --password @keychain:"Application Loader: $APP_STORE_USERNAME"
if [[ $? -ne 0 ]] ; then
    exit 1
fi
echo "Uploading the app..."
xcrun altool --upload-app --file "$IPA_PATH" --username "$APP_STORE_USERNAME" --password @keychain:"Application Loader: $APP_STORE_USERNAME"