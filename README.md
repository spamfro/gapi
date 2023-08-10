# Google APIs

## Install live certificates
Fetch certificates:
```
openssl enc -aes-128-cbc -pbkdf2 -salt -d -in ~/ws-archive/certs.tar.gz.bin | tar xzv
```

## Manage secrets
Fetch secrets:
```
openssl enc -aes-128-cbc -pbkdf2 -salt -d -in ~/ws-archive/pilot.tar.gz.enc | tar xzv
```
Update secrets:
```
tar czv secrets | openssl enc -aes-128-cbc -pbkdf2 -salt -out ~/ws-archive/pilot.tar.gz.enc
```

## Run local
```
npx http-server ./app -c-1 --ssl -a spamfro.site -p 3443 --cert ./certs/cert.pem --key ./certs/cert-key-nopassword.pem
```

## Deploy
```
git -C ~/ws/DEV subtree split --prefix=georgevs/pilot/playground/test-googleapis-web/app -b github/test-googleapis-web

git push git@github-spamfro:spamfro/spamfro.github.io.git --force github/test-googleapis-web:main
```