# Git Repo Contribution Graph

Get a contribution graph of each contributor of a git repo on the latest version of the code

It will count the line written (or edited) by each contributor on the latest version of the code.

This does not show the number of line that was written since the beginning of the project, only on the latest version of the code (supposedly the one that matters)

## Run

1. Got on your repo

```
cd my-repo
```

2. From your repo run the command

```
npx git-repo-contribution-graph
```

## Example

Contribution Graph:

```
George: 299 (2.05%)  | ##
Sam: 3282 (22.54%)   | ##################
Mark: 2071 (14.22%)  | ############
Elon: 8898 (61.11%)  | ##################################################
Tim: 1 (0.01%)       |
```
