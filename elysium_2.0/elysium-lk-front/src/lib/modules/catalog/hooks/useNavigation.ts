import { useRouter } from 'next/navigation';

export const useNavigation = () => {
  const router = useRouter();

  const goToCategory = (categoryId: number) => {
    router.push(`/catalog/${categoryId}`);
  };

  const goToQuestion = (categoryId: number, questionId: number) => {
    router.push(`/catalog/${categoryId}/question/${questionId}`);
  };

  const goToCatalog = () => {
    router.push('/catalog');
  };

  const goBack = () => {
    router.back();
  };

  return {
    goToCategory,
    goToQuestion,
    goToCatalog,
    goBack,
  };
}; 