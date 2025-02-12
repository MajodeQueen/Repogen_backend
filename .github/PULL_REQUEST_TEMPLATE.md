<!-- -->
***
<!-- Before opening a non-draft version of pull request, please ensure: -->
- [ ] 📖 Proper label is applied to indicate the type of change.
- [ ] ❓ Each commit includes both a *WHAT* and a *WHY*.
- [ ] 🔥 Tests for these changes have been added (for bug fixes/features).
- [ ] 📚 Docs have been added/updated if needed (for bug fixes/features).
- [ ] 🌍 New and existing tests have been run and all pass.
- [ ] 🔗 Links to relevant tests are pasted below.

<details><summary>Link to Tests</summary>
Paste links to relevant tests that need to be run...
</details>

<details>
  <summary>For Reviewer</summary>
  Before approving code, reviewer must pull down changes and make sure the code runs on their machine and tests pass.

#### Merging

ssh-keygen -t ed25519 -C "dr.kimanjepatrick@gmail.com-github"



If there is a single commit referencing a single ticket, please preform a rebase merge.
  ```
  (KH-555) - Feature 1             8d7ac9e
  ```

If there are multiple commits referencing multiple tickets, please preform a rebase merge.
  ```
  (KH-555) - Feature 1             8d7ac9e
  (KH-666) - Feature 2             8d7ac21
  ```

If there are multiple commits related to a singe ticket please preform a squash merge while referencing ticket in description.
  ```
  Update typo                      8d323se
  Remove console.log               8dd929e
  New feature                      814ac9e
  ```
</details>