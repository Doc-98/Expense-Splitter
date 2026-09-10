// The actual "1.<PR number>" extraction — kept as a plain, pure function
// (a commit subject line in, a version string or null out) so it can be
// unit-tested directly, independent of running an actual `git log` from
// Node. See vite.config.js for the caller that does.
//
// Every PR merged into this repo is squash-merged, and GitHub always
// appends " (#123)" to a squash-merge's own commit subject — so the most
// recent commit reachable from whatever's being built already names its
// own PR number, with nothing to track by hand.
const PR_NUMBER_RE = /\(#(\d+)\)\s*$/

export function parseVersionFromCommitMessage(subject) {
  const match = PR_NUMBER_RE.exec(subject || '')
  return match ? `v1.${match[1]}` : null
}

// Walks a list of commit subjects (newest first — the order `git log`
// already returns them in) and returns the version from the first one
// that has a PR number. Building from master itself, that's always the
// very last merge. Building from a feature branch ahead of master (mid-PR,
// before it has a number of its own yet), this instead falls through to
// whatever the most recently merged PR actually was — an honest "last
// known shipped version," not a crash or a made-up placeholder.
export function findLatestVersion(subjects) {
  for (const subject of subjects) {
    const version = parseVersionFromCommitMessage(subject)
    if (version) return version
  }
  return null
}
