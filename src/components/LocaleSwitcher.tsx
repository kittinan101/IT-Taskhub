'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { locales } from '@/i18n';

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
      <select
        id="locale-select"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        value={locale}
        onChange={(e) => onSelectChange(e.target.value)}
        disabled={isPending}
      >
        {locales.map((cur) => (
          <option key={cur} value={cur}>
            {t(`languageOptions.${cur}`)}
          </option>
        ))}
      </select>
      {isPending && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Changing language...
        </p>
      )}
    </div>
  );
}