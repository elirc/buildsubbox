# Maintainer Communication

## Ask For Help Without Outsourcing Thinking

Good question shape:

```md
I am trying to change [specific behavior].
I read [file anchors].
I expected [result], but saw [result].
I tried [debug steps].
My current hypothesis is [hypothesis].
Could you confirm whether [specific design direction] fits the project?
```

## Bug Report Template

```md
## Reproduction
1.
2.

## Expected

## Actual

## Files inspected

## Hypothesis

## Environment
```

## Feature Proposal Template

```md
## User problem
## Proposed behavior
## Existing pattern to follow
## Files likely touched
## Risks
## Test plan
```

## Responding To Requested Changes

Good:

> Thanks, that makes sense. I moved the status transition into a helper and preserved the existing terminal behavior for `Suppressed` and `Shipped`. I also added a note for future tests.

Avoid:

> Done.

## Respectful Disagreement

Use evidence:

> I see the concern about over-abstracting. My reason for extracting this helper is that it is a finite state transition at `src/App.jsx:571-582`, and the next ticket adds tests for it. I can keep it local to `App.jsx` if you prefer a smaller step.
