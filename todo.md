## Melee .slp upload / digest for tournament organizers ("spectator" client)

- [x] upload files
- [x] parse slippis
- [x] store slp onto my vps
- [ ] try storing temp files on  
  - https://uguu.se (24 hours, nice direct download)
  - https://tmp.ninja (48 hours, not weeb)

```
curl -i -F 'files[]=@hi.txt' https://uguu.se/upload.php
curl -i -F 'file=@hi.txt' https://tmp.ninja/api.php?d=upload
```
- [x] generate thumbnails from slippi files
- [x] dual column layout
- [x] .... Move upload to left side (include instructions) and watch/ticker to right side
- [x] combine games from sets
- [ ] /create-tournament
- [ ] .... post request or something
- [ ] .... /dashboard
- [ ] /tournament/id
i dont think i have to actually group it by tournament