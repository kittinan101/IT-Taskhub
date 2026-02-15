'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { locales } from '@/i18n';
import CustomSelect from '@/components/ui/CustomSelect';

export default function LocaleSwitcher() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      // Update the URL with the new locale
      const newPath = window.location.pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.push(newPath || `/${nextLocale}`);
    });
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="locale-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('language')}
      </label>
      <CustomSelect
        value={locale}
        onChange={(val) => onSelectChange(val)}
        options={locales.map((cur) => ({
          value: cur,
          label: t(`languageOptions.${cur}`),
        }))}
      />
      {isPending && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Changing language...
        </p>
      )}
    </div>
  );
}