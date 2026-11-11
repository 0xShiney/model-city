"use client";

import type { AppId } from "./meta";
import { DashboardApp, MailApp, SettingsApp } from "./core";
import { ComputeApp, DataRoomApp, ResearchApp, TrainingApp } from "./build";
import { PricingApp, ProductApp, WebApp } from "./commerce";
import { LegalApp, MarketApp, SocialApp } from "./world";
import { InvestorsApp, OfficeApp, TeamApp } from "./people";

const SURFACES: Record<AppId, () => React.ReactElement | null> = {
  dashboard: DashboardApp,
  research: ResearchApp,
  data: DataRoomApp,
  training: TrainingApp,
  compute: ComputeApp,
  product: ProductApp,
  web: WebApp,
  pricing: PricingApp,
  social: SocialApp,
  investors: InvestorsApp,
  team: TeamApp,
  market: MarketApp,
  legal: LegalApp,
  office: OfficeApp,
  mail: MailApp,
  settings: SettingsApp,
};

export function AppSurface({ app }: { app: AppId }) {
  const Surface = SURFACES[app];
  if (!Surface) return null;
  return <Surface />;
}
