# Running a study end to end with Prolific

Prolific is a panel provider: it recruits and pays the respondents who take a study.
With this skill and a Prolific tool side by side, a whole study can be run from here without the user opening either web interface:

1. Build and preview the study (this skill).
2. Start the data collection and push the study to Prolific as a draft (this skill).
3. Set the reward, places and audience on the draft and publish it (Prolific tool).
4. Follow the respondents as they come in (both).
5. Stop the study when there is enough data (both).
6. Analyze the results (this skill).

Without a Prolific tool, step 3 and the Prolific half of steps 4 and 5 are done by the user in the Prolific web interface. That works, but every change goes through the user.
So when the user wants to recruit respondents, check what is set up and offer to help with the missing parts. The setup is done once.

## What has to be set up

Three things, each independent of the others:

1. **Prolific is connected to the iMotions account.** This is what lets iMotions create the draft study. The user does it once in the iMotions web interface under panel providers, with an API token from Prolific.
2. **The panel provider permission was granted** when this skill was authorized. If it was not, the user runs the logout command and authorizes again with the permission enabled.
3. **A Prolific tool is available to you**, either the Prolific CLI or the Prolific MCP server, with its own API token.

The first two are checked when a study is pushed: start-data-collection with `--panel-provider` fails with an explanation if one of them is missing, before it starts or pushes anything. Ask the user about them beforehand if you want to avoid that.
For the third, check whether you have Prolific MCP tools, and otherwise whether `prolific whoami` works in a shell.

### The API token

Both Prolific tools read the token from the `PROLIFIC_TOKEN` environment variable. The user creates it in Prolific at https://app.prolific.com/researcher/tokens/ (API Tokens, then Create API token).

The token gives full access to the Prolific account, including spending its balance. Ask the user to set the environment variable themselves, and do not ask them to paste the token into the conversation.

- Windows: `setx PROLIFIC_TOKEN "the token"` in a terminal, or through "Edit environment variables for your account" in the Start menu.
- macOS and Linux: add `export PROLIFIC_TOKEN="the token"` to the shell profile, such as `~/.zshrc` or `~/.bashrc`.

An environment variable is only seen by programs started after it was set, so the user has to restart the agent application (and its terminal) before you can use it.

### Option 1: the Prolific CLI

Use the CLI when you can run shell commands. It is a single file with no dependencies, and it can change a draft study. It is published at https://github.com/prolific-oss/cli.

- **Windows**: download `prolific-windows-amd64` from https://github.com/prolific-oss/cli/releases/latest. The downloaded file has no file extension, so Windows will not run it until it is renamed to `prolific.exe`. Then place it in a folder that is on the `PATH`. You can do all of this for the user, for example:

  ```powershell
  $dir = "$env:LOCALAPPDATA\Programs\prolific"
  New-Item -ItemType Directory -Force $dir
  Invoke-WebRequest "https://github.com/prolific-oss/cli/releases/latest/download/prolific-windows-amd64" -OutFile "$dir\prolific.exe"
  [Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$dir", "User")
  ```

  Until the agent application is restarted the new `PATH` is not in effect, so run it by its full path.
- **macOS**: `brew install prolific-oss/tap/prolific`
- **Linux**: download `prolific-linux-amd64` from the same page, make it executable with `chmod +x`, and move it to a folder on the `PATH` as `prolific`.

Check that it works with `prolific whoami`, which shows the Prolific user the token belongs to.
The commands used in the workflow below, where the ID is the Prolific study ID:

- `prolific study view ID` shows a study.
- `prolific study update ID -t updates.json` changes a study from a JSON file that has only the fields to change. On a draft every field can be changed.
- `prolific study test ID` creates a test run of a draft without publishing it. It needs a test participant in the Prolific workspace.
- `prolific study transition ID -a PUBLISH` publishes a draft. The other actions are `PAUSE`, `START` and `STOP`.
- `prolific study increase-places ID -p 50` sets a higher total number of places on a published study. Places cannot be decreased.
- `prolific study submission-counts ID --json` shows the number of submissions by status.
- `prolific submission list -s ID --csv` lists the submissions of a study.
- `prolific filters search "keyword"` and `prolific filters choices FILTER_ID` find audience filters and their values, and `prolific audience count` shows how many participants match a set of filters.
- `prolific reward-recommendations -c USD -w WORKSPACE_ID` shows Prolific's recommended hourly rates.

Several commands open an interactive view by default, which does not work when you run them. Add `--json`, `--csv` or `--table` (`-n` on submission-counts) to get plain output. Every command explains its options with `--help`.

### Option 2: the Prolific MCP server

Use the MCP server in an agent application that cannot run shell commands. It is published at https://github.com/prolific-oss/prolific-mcp and is not in the Python package index, so it is run directly from GitHub with `uvx`. That requires Python 3.11 or newer and uv (https://docs.astral.sh/uv/, on Windows `winget install astral-sh.uv`).

- **Claude Code**: the user runs `claude mcp add prolific -e PROLIFIC_TOKEN=the-token -- uvx --from git+https://github.com/prolific-oss/prolific-mcp prolific-mcp` with their own token.
- **Claude Desktop**: the simplest way is the `.mcpb` bundle for the user's platform from https://github.com/prolific-oss/prolific-mcp/releases.
- **Other applications**: the user adds it to the application's MCP configuration file and restarts the application.

  ```json
  {
      "mcpServers": {
          "prolific": {
              "command": "uvx",
              "args": ["--from", "git+https://github.com/prolific-oss/prolific-mcp", "prolific-mcp"],
              "env": {"PROLIFIC_TOKEN": "the token"}
          }
      }
  }
  ```

The MCP server can publish, pause and stop a study and list its submissions. Check its tool list for a way to change an existing draft. If it has none, the reward, places and audience of the draft are set with the CLI or by the user in Prolific.

## The workflow

### 1. Build and start

Build and preview the study as described in [study-editing.md](./study-editing.md). When the user has approved it, start it and push it in one go:

`aimotions start-data-collection "Study name" --panel-provider prolific`

The output has the URL of the draft study in Prolific. The last part of the URL is the Prolific study ID that the Prolific tool needs.

### 2. Finish the draft in Prolific

The draft that iMotions created already has:

- The link that sends participants to the iMotions study, and the completion codes that send them back. Do not change these.
- A description that tells participants which devices, camera and microphone the study requires.
- The device requirements from the iMotions study, and filters for the sensors it uses. Keep these when adding other filters.
- The estimated completion time, based on the exposure times in the longest flow.
- 10 places per flow.
- A reward of 0.

What is left to decide, together with the user:

- **Reward.** It starts at 0, so it has to be set before publishing. Prolific has a minimum hourly rate, so base it on the estimated completion time.
- **Places.** How many participants to recruit. With manual flow selection, the draft has a separate link and number of places for each flow.
- **Audience.** Filters such as country, language, age or a representative sample.
- **Public name and description.** Participants see the study name from iMotions unless it is changed.

With the CLI, look at the draft with `prolific study view` and then change it with `prolific study update`, for example with this file for a reward of 2.50 and 5 places:

```json
{"reward": 250, "total_available_places": 5}
```

The reward is in the smallest unit of the currency of the Prolific account, which is US cents or British pence, so 250 is $2.50 or £2.50. `prolific study list -f ID,Name,Reward,PresentmentCurrencyCode --table` shows the currency of each study. Tell the user the amount with its currency.
Getting this wrong by a factor of 100 is expensive, so check the reward with `prolific study view` after the update.
When changing the `filters`, include the filters the draft already has so they are not lost.

### 3. Publish

**Publishing spends real money.** Participants can start right away and completed submissions are paid automatically. Always show the user the reward, the number of places and the total cost including Prolific's fee, and get a clear yes before publishing.

`prolific study transition ID -a PUBLISH`

If the Prolific workspace has a test participant, `prolific study test ID` first creates a test run of the draft that costs nothing.
Otherwise suggest a small pilot first, for example 5 places. Check that the pilot respondents arrive in iMotions with usable data, then increase the places with `prolific study increase-places`. The design of a started study cannot be changed, so a mistake found later means copying the study with copy-study and pushing the copy.

### 4. Follow the progress

- In Prolific, `prolific study submission-counts ID --json` shows how many participants have started, completed, returned or timed out, and `prolific submission list -s ID --csv` lists each submission with its participant ID.
- In iMotions, `aimotions list-respondents-csv "Study name" --progress` shows each respondent, how far they are, and whether their data has been processed.

Every respondent that came from Prolific has the URL variables `prolificParticipantId`, `prolificStudyId` and `prolificSessionId`, shown by list-respondents-csv and respondent-details. Use them to match a respondent in iMotions with a submission in Prolific, for example to find out why a submission has no data.

How a submission ends in Prolific depends on how the respondent left the iMotions study:

- Completed the study: approved and paid automatically.
- Declined consent: asked to return the submission.
- Stopped by a technical error: left for manual review in Prolific. Look the respondent up in iMotions and let the user decide.
- Closed the browser partway through: Prolific is not told, so the submission stays open there until it is returned or times out. In iMotions the respondent ends up as Abandoned.

Not every completed respondent has good data. To collect a number of respondents with usable data, create a dynamic segment with data quality criteria and a `--target` (see [dynamic-segments.md](./dynamic-segments.md)) and add places in Prolific until the segment reaches its target.

### 5. Stop

When there are enough respondents, stop both sides. Pause or stop the study in Prolific with `prolific study transition ID -a PAUSE` (or `STOP`) so no more participants are sent, and run `aimotions stop-data-collection "Study name"`.
Stopping in iMotions only prevents new respondents from starting. Respondents who have already started can finish, so there is no need to wait for them.

### 6. Analyze

The data of a respondent is processed after they finish, and they are shown as Processing until it is done. Then analyze the results with the commands in the main skill document.

## Things to know

- A study can only be pushed once. To run it again, or to change the design, copy it with copy-study and push the copy, which creates a new draft in Prolific.
- After a push, the redirects of the iMotions study point to Prolific and cannot be changed with edit-study.
- Changing the devices with edit-study after the push does not update the device requirements in Prolific. Change them there too.
- The draft is placed in the default workspace and project of the Prolific user whose token is connected to iMotions. If the Prolific tool uses a token from another user, it may not have access to the draft.
