# Cashcash

## How to create a self sign certificate

In powershell administrator:
New-SelfSignedCertificate -DnsName test.OJ.com -CertStoreLocation cert:\LocalMachine\My -type CodeSigning
\$cert = @(Get-ChildItem cert:\LocalMachine\My -CodeSigning)[0]

Then follow this https://www.osradar.com/create-self-signed-certificate-windows/
to extract the pfx

Reasons cashcash exists:

-   Import from my bank
-   Procrastinate when to put category
-   Fine grained search to see
-   Visually appealing graph to enjoy going back at it
-   Automatic rule system to avoid having to repeat ourself
-   Multi-currency support
-   Fine grained tree structure account

# Publish process Apple:

-   change the version in package.json
-   change the version in info.plist of pro manual folder
-   run yarn build
-   run node ./script/signOsx.js --dev
-   open the app
-   run node ./script/signOsx.js
-   run ./script/uploadScript.sh

If there is a problem with signing use DEBUG=electron-osx-sign\*
