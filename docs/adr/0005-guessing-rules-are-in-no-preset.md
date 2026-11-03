# Rules that guess are in no preset

A rule that guesses (it reads names, sees only literals, or cannot tell intent) can misfire, and a preset is a promise that its rules are safe to enable together. So `noHardcodedSecrets`, `noLogModule` and the low-confidence rules (`noInsecureCookie`, `noWeakHash`, `noStackInResponse`, `noSensitiveBrowserStorage`, `noLocationHeader`, `noPublicFileUpload`, `noSuiteQLSelectStar`, `noSuiteQLSystemNoteJoin`) are in no preset, whatever their source says, and the README table says why. This holds even for `noHardcodedSecrets`, where Oracle's own documentation says "Don't hard-code any passwords in scripts".

## Consequences

A consumer enables each of these rules by name. Such a rule may still be written when its source is clear, but not when its sources contradict themselves or when it needs information a static AST cannot provide.
