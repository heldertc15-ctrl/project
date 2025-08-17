# External APIs

## TheSportsDB API

Purpose: To fetch a list of upcoming soccer matches.

Documentation: https://www.thesportsdb.com/api.php

Authentication: For the MVP, we will use the public endpoint which does not require an API key. A key may be used in the future for increased reliability.

Rate Limits: The public endpoint has a rate limit that must be handled gracefully.

Key Endpoint: "Next 15 Events by League ID" (e.g., eventsnextleague.php?id=LEAGUE_ID).