# ClickFix - Education

An educational, local-only simulator of a ClickFix-style social engineering page,
built for a cybersecurity awareness video. It shows how a fake "Verify you are
human" prompt can lead a user to paste and run something they should not. The
point is to teach people to recognize it.

## What this is

- A UI demo. Two pages plus a private local dashboard.
- A teaching prop for a video about social engineering.
- Runs on 127.0.0.1 by default. Nothing leaves the machine.

## What this is not

- Not a real attack tool.
- Not for use against anyone or any system you do not own.
- Not to be deployed on the public internet.
- Not to be used on machines or networks you are not authorized to test.

## Who made it and why

Made by an individual for a personal educational cybersecurity video.
No company, no product, no service. Just a demo used on camera to explain
how these pages work so viewers can spot them.

## Legal and ethical note

This project exists for education, awareness, and defense. Running it against
systems you do not own or have written permission to test is illegal in most
countries and is not what this project is for. The author does not condone,
support, or take any responsibility for misuse. Use it only in your own
isolated lab, only on machines you control, only for learning.

## Setup

npm install
npm start

Open:

http://127.0.0.1:3000/verify
http://127.0.0.1:3000/lab-control

Default bind is 127.0.0.1. Loopback only.

## Pages

- /verify — the fake captcha page.
- /complete — shown only after the lab dashboard flips the session state.
- /lab-control — private local dashboard that drives the state.

## Notes

- State is in memory only. Restart resets it.
- No data is collected, stored, or sent anywhere.
- No executable is included in this repository.

## License

For educational use only. See the note above.