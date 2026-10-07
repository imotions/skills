# iMotions Help Center workflow

Use this reference for iMotions Lab how-to questions or product behavior not covered by the core skill.

## Check the installed version

Before relying on Help Center content, read the installed iMotions Lab version from `AttentionTool.exe` next to AtCli:

```powershell
(Get-Item "C:\Program Files\iMotions\Lab_XG\AttentionTool.exe").VersionInfo.ProductVersion
```

Treat this executable as the installed version in use. Do not rely on the Windows uninstall list, which may contain older installations.

## Evaluate article applicability

* Prefer articles that apply to the installed major version.
* Treat version markers in titles such as `Legacy 9.3.3` or `9.4.4 or earlier` as applicability warnings.
* Use version-specific legacy articles only when no current article covers the question, and tell the user that the guidance is version-specific.
* Compare requirements such as `From iMotions 9.2 and onwards` against the installed version.
* Use **Release Notes & Downloads** for questions about when a feature was introduced, not as the primary source for procedural instructions.
* Ignore iMotions Online-only guidance when answering an iMotions Lab question.
* Mention the installed version when it affects whether the documented steps apply.

## Search the Help Center

```text
AtCli.exe search-help "search phrase"
```

The command returns up to 10 results containing:

* `articleId`
* `title`
* `breadcrumb`
* `snippet`

Pass the complete `articleId` to `help-article`, including both parts of IDs shaped like:

```text
<space id>/<article id>
```

Some outdated articles remain in current Help Center sections and may be identifiable only by their title. Apply the version checks above before relying on them.

## Read an article

```text
AtCli.exe help-article <article id>
```

The result contains:

* `id`
* `title`
* `url`
* Markdown `content`

Include the article URL in the user-facing answer.

Links inside article content may be relative slugs rather than article IDs. To follow one, search for the linked article title instead of passing the slug directly to `help-article`.

## Connectivity

`search-help` and `help-article` require both:

* a running iMotions Lab application
* internet access to the iMotions cloud

If either command returns:

```text
Error 500: Internal Server Error : Ensure you can connect to the iMotions cloud from this computer
```

Do not retry repeatedly.

This error can occur even when general internet access is working and may clear on its own. Tell the user that Help Center search is temporarily unavailable and provide:

```text
https://help.imotions.com
```

as the fallback.
