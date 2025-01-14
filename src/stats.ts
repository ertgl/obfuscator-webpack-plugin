import type { SyncHook } from "tapable";
import type { Compilation } from "webpack";

export type NormalizedStats = StatsPrinterHookTapFunctionArgs[1];

export type StatsPrinter = StatsPrinterHookTapFunctionArgs[0];

type StatsPrinterHookTapFunctionArgs = (
  Compilation["hooks"]["statsPrinter"] extends SyncHook<[
    infer T_StatsPrinter,
    infer T_NormalizedStats,
  ]>
    ? [T_StatsPrinter, T_NormalizedStats]
    : [unknown, unknown]
);
