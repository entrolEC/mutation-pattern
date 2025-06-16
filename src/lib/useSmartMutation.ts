import { QueryKey, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { FieldValues } from 'react-hook-form';
import { nanoid } from 'nanoid';
import queryClient from './query-client';

export type SetErrorFunction<T> = (name: keyof T | 'root', error: { type: string; message: string }) => void;

type MutationContext<TReq> = {
  prevData?: any;
  optimisticId?: string;
  optimisticReq?: TReq;
};

/**
 * 낙관적 업데이트와 form에서의 에러 핸들링이 추상화된 훅입니다.
 * @param queryKey queryKey가 있다면 낙관적 업데이트를 수행합니다.
 * @param mutationFn
 * @param setError form의 setError를 전달받아 서버의 validation에러 응답을 특정 필드까지 전달할 수 있습니다.
 * @param options onSuccess, onError등 option을 오버라이드 할 수 있습니다.
 * @param onSuccessCallback onSuccess 콜백
 * @param disableOptimisticUpdate 낙관적 업데이트 비활성화 여부
 * @param isList 리스트 데이터를 다루는지에 대한 여부입니다.
 */
export function useSmartMutation<TRequest extends FieldValues, TResponse>({
  queryKey,
  mutationFn,
  setError,
  options,
  onSuccessCallback,
  disableOptimisticUpdate = false,
  isList = false,
}: {
  queryKey?: QueryKey;
  mutationFn: (data: TRequest) => Promise<TResponse>;
  setError?: SetErrorFunction<TRequest>;
  options?: Omit<UseMutationOptions<TResponse, any, TRequest, MutationContext<TRequest>>, 'mutationFn'>;
  onSuccessCallback?: (response: TResponse) => void;
  disableOptimisticUpdate?: boolean;
  isList?: boolean;
}) {
  const mutationOptions: UseMutationOptions<TResponse, any, TRequest, MutationContext<TRequest>> = {
    mutationFn,
    ...(queryKey && {
      ...(!disableOptimisticUpdate && {
        /** ---------- optimistic ---------- */
        onMutate: async (updatedData) => {
          await queryClient.cancelQueries({ queryKey });
          const prevData = queryClient.getQueryData<any>(queryKey);

          if (isList && prevData) {
            const optimisticId = nanoid();
            const optimisticItem = { ...updatedData, __optimisticId: optimisticId };

            queryClient.setQueryData(queryKey, [...prevData, optimisticItem]);

            return { prevData, optimisticId, optimisticReq: updatedData };
          } else if (!isList && prevData) {
            queryClient.setQueryData(queryKey, {
              ...prevData,
              ...updatedData,
            });
          }

          return { prevData };
        },
      }),
      /** ---------- success ---------- */
      onSuccess: (response, variable, context) => {
        if (isList && queryKey) {
          queryClient.setQueryData<any[]>(queryKey, (old = []) =>
            old.map((item) => (item.__optimisticId === context?.optimisticId ? response : item))
          );
        } else if (queryKey) {
          queryClient.setQueryData<TResponse>(queryKey, (old) => {
            if (!old) return old;
            return {
              ...old,
              ...response,
            };
          });
        }

        if (onSuccessCallback) onSuccessCallback(response);
      },
    }),
    /** ---------- error / rollback ---------- */
    onError: (error, variable, context) => {
      // rollback
      if (context?.prevData && queryKey) {
        queryClient.setQueryData(queryKey, context.prevData);
      }
      console.error('error', error);
    },
    ...options,
  };

  return useMutation(mutationOptions);
}
