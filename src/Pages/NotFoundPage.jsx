import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';

export const NotFoundPage = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  return (
    <h1>{language.notFound}</h1>
  );
};