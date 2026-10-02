---
title: "如何在 Android debug 的时候使用 adb install 命令降级安装应用"
description: "解释 Android Package Manager 拒绝低 versionCode APK 的原因，介绍调试场景下使用 adb install 的降级安装参数和限制。"
pubDate: 2025-12-08
category: "Android"
tags:
  - "Android"
  - "Adb"
  - "经验分享"
  - "Android runtime"
csdnUrl: "https://blog.csdn.net/TeleostNaCl/article/details/155717338"
draft: false
---

我们在做 `Android` 应用开发的时候，有时候需要安装旧版本应用测试一些东西，但是在本机已经安装了新版本应用，或者系统预装了新的版本的时候，直接安装或使用 `adb install` 安装时，是会直接失败的，原因是 `Android` 的 `Package Manager` 是不允许降级安装的，例如 尝试使用 `adb install` 降级安装，会报类似以下的错误：
```text
Failed to commit install session 883258075 with command package install-commit 883258075. Error: INSTALL_FAILED_VERSION_DOWNGRADE: Downgrade detected: Update version code 251207 is older than current 251208
```

核心错误即是 `INSTALL_FAILED_VERSION_DOWNGRADE`，即因降级安装失败，其校验的是 `apk` 的 `versioncode`。

这块逻辑的核心代码在 `frameworks/base/services/core/java/com/android/server/pm/InstallPackageHelper.java` 的 `verifyReplacingVersionCode` 的方法中：
```java
// frameworks/base/services/core/java/com/android/server/pm/InstallPackageHelper.java#verifyReplacingVersionCode()
if (!PackageManagerServiceUtils.isDowngradePermitted(installFlags,
        dataOwnerPs.isDebuggable())) {
    // The data exists on some users and downgrade is not permitted; a lower
    // version of the app will not be allowed.
    try {
        PackageManagerServiceUtils.checkDowngrade(dataOwnerPs, pkgLite);
    } catch (PackageManagerException e) {
        String errorMsg = "Downgrade detected on app uninstalled with"
                + " DELETE_KEEP_DATA: " + e.getMessage();
        Slog.w(TAG, errorMsg);
        return Pair.create(
                PackageManager.INSTALL_FAILED_VERSION_DOWNGRADE, errorMsg);
    }
}

// frameworks/base/services/core/java/com/android/server/pm/PackageManagerServiceUtils.java
/**
 * Check and throw if the given before/after packages would be considered a
 * downgrade with {@link PackageSetting}.
 */
public static void checkDowngrade(@NonNull PackageSetting before,
        @NonNull PackageInfoLite after) throws PackageManagerException {
    checkDowngrade(before.getVersionCode(), before.getBaseRevisionCode(),
            before.getSplitNames(), before.getSplitRevisionCodes(), after);
}

private static void checkDowngrade(long beforeVersionCode, int beforeBaseRevisionCode,
        @NonNull String[] beforeSplitNames, @NonNull int[] beforeSplitRevisionCodes,
        @NonNull PackageInfoLite after) throws PackageManagerException {
    if (after.getLongVersionCode() < beforeVersionCode) {
        throw new PackageManagerException(INSTALL_FAILED_VERSION_DOWNGRADE,
                "Update version code " + after.versionCode + " is older than current "
                        + beforeVersionCode);
    } else if (after.getLongVersionCode() == beforeVersionCode) {
        if (after.baseRevisionCode < beforeBaseRevisionCode) {
            throw new PackageManagerException(INSTALL_FAILED_VERSION_DOWNGRADE,
                    "Update base revision code " + after.baseRevisionCode
                            + " is older than current " + beforeBaseRevisionCode);
        }

        if (!ArrayUtils.isEmpty(after.splitNames)) {
            if (beforeSplitNames.length != beforeSplitRevisionCodes.length) {
                throw new PackageManagerException(INSTALL_FAILED_VERSION_DOWNGRADE,
                        "Current split names and the split revision codes are not 1:1 mapping."
                                + "This indicates that the package info data has been"
                                + " corrupted.");
            }

            for (int i = 0; i < after.splitNames.length; i++) {
                final String splitName = after.splitNames[i];
                final int j = ArrayUtils.indexOf(beforeSplitNames, splitName);
                if (j != -1) {
                    if (after.splitRevisionCodes[i] < beforeSplitRevisionCodes[j]) {
                        throw new PackageManagerException(INSTALL_FAILED_VERSION_DOWNGRADE,
                                "Update split " + splitName + " revision code "
                                        + after.splitRevisionCodes[i]
                                        + " is older than current "
                                        + beforeSplitRevisionCodes[j]);
                    }
                }
            }
        }
    }
}
```

详见：
- [https://cs.android.com/android/platform/superproject/main/+/main:frameworks/base/services/core/java/com/android/server/pm/InstallPackageHelper.java;l=2868](https://cs.android.com/android/platform/superproject/main/+/main:frameworks/base/services/core/java/com/android/server/pm/InstallPackageHelper.java;l=2868)
- [https://cs.android.com/android/platform/superproject/main/+/main:frameworks/base/services/core/java/com/android/server/pm/PackageManagerServiceUtils.java;l=1440](https://cs.android.com/android/platform/superproject/main/+/main:frameworks/base/services/core/java/com/android/server/pm/PackageManagerServiceUtils.java;l=1440)

可以看到，在 `InstallPackageHelper.java#verifyReplacingVersionCode()` 方法中，会调用到 `PackageManagerServiceUtils.java#checkDowngrade()` 方法，然后依次比对 `VersionCode`，`BaseRevisionCode`，`SplitNames`, `SplitRevisionCodes` 的版本好，如果新的 `apk` 小于旧的 `apk`，则抛出 `INSTALL_FAILED_VERSION_DOWNGRADE` 错误，不允许安装。

同时谷歌也为我们调试提供了一个便捷的方法，我们可以查阅 `adb` 的帮助文档，了解到 `install` 的用法：
```text
app installation (see also `adb shell cmd package help`):
 install [-lrtsdg] [--instant] PACKAGE
     push a single package to the device and install it
 install-multiple [-lrtsdpg] [--instant] PACKAGE...
     push multiple APKs to the device for a single package and install them
 install-multi-package [-lrtsdpg] [--instant] PACKAGE...
     push one or more packages to the device and install them atomically
     -r: replace existing application
     -t: allow test packages
     -d: allow version code downgrade (debuggable packages only)
     -p: partial application install (install-multiple only)
     -g: grant all runtime permissions
     --abi ABI: override platform's default ABI
     --instant: cause the app to be installed as an ephemeral install app
     --no-streaming: always push APK to device and invoke Package Manager as separate steps
     --streaming: force streaming APK directly into Package Manager
     --fastdeploy: use fast deploy
     --no-fastdeploy: prevent use of fast deploy
     --force-agent: force update of deployment agent when using fast deploy
     --date-check-agent: update deployment agent when local version is newer and using fast deploy
     --version-check-agent: update deployment agent when local version has different version code and using fast deploy
     (See also `adb shell pm help` for more options.)
 uninstall [-k] PACKAGE
     remove this app package from the device
     '-k': keep the data and cache directories
```
可以看到 `-d: allow version code downgrade (debuggable packages only)` 这个参数运行在 `debuggable` 包进行降级安装，方便我们调试。

因此，如果我们拥有一个 `debuggable` 的应用安装包，或者是一个 `userdebug` 的系统，则可以直接进行降级安装，使用以下命令即可：
```shell
adb install -d -r apk.path
```

注意，如果是覆盖安装了系统应用，那么在重启之后会被还原到系统应用。
