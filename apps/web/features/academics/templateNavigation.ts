type NavigationSection = { navigationEnabled?: boolean; navigationId?: string; navigationLabel?: string; navigationOrder?: number };
type Tab = { label: string; id: string };

export function templateSectionId(section: NavigationSection): string | undefined {
  return section.navigationEnabled && /^section-[a-zA-Z0-9-]+$/.test(section.navigationId ?? '') ? section.navigationId : undefined;
}

export function mergeTemplateTabs(tabs: Tab[], sections: NavigationSection[]): Tab[] {
  const result = [...tabs];
  const additions = sections.map((section, index) => ({ section, index })).filter(({ section }) => templateSectionId(section) && section.navigationLabel?.trim()).sort((a, b) => (a.section.navigationOrder ?? 1) - (b.section.navigationOrder ?? 1) || a.index - b.index);
  let previous = 0;
  for (const { section } of additions) {
    const id = templateSectionId(section)!;
    if (result.some(tab => tab.id === id)) continue;
    const position = Math.min(result.length, Math.max(previous, Math.max(0, (section.navigationOrder ?? 1) - 1)));
    result.splice(position, 0, { id, label: section.navigationLabel!.trim() });
    previous = position + 1;
  }
  return result;
}
