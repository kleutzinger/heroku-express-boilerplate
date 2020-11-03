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
- [x] make .prettierrc (single quote)

## expansion october 27

bonuses for first time upload
challenge people to upload high score
veripfy by choosing a random rare char + color, and have slp file uploaded (unranked (NOT 1 player))
collab?
api to accept and reject ALL slippi files in folder
match with smashg..

GOAL
get people to upload as many .slp files as i can handle
have them matched and organized automatically
have them easy to watch from wherever
API FOR SLIPPI DESKTOP LAUNCHER

how to match replay files to smash.gg sets:

smash gg auto striker crx:
chrome extension autofiller
saved per character
show twitch stream "this player is now live"
suggest uploading replays to https://replay.kevbot.xyz
show homepage

make badge for all kevbot.xyz sites/extensions

twitch extension show score of current set (connect to smash.gg acct)
