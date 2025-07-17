import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: string) => {
    console.log('Changing language to:', language);
    i18n.changeLanguage(language);
    console.log('Current language after change:', i18n.language);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">
            {t('language.english')}
          </SelectItem>
          <SelectItem value="fr">
            {t('language.french')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// Alternative button-style switcher
export const LanguageToggle = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'fr' : 'en';
    console.log('Toggling language from', i18n.language, 'to', newLanguage);
    i18n.changeLanguage(newLanguage);
    console.log('Language toggled to:', i18n.language);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      {i18n.language === 'en' ? 'FR' : 'EN'}
    </Button>
  );
};