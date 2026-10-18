"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Pagination } from "../ui/Pagination";
import { EmptyState, ErrorState, LoadingState } from "../ui/States";
import { buttonClass } from "../ui/styles";
import { useQueryParams } from "../ui/useQueryParams";
import type { Page } from "./api";
import type { PageState } from "./usePage";

export function PagedList<T>({
  children,
  empty,
  errorTitle,
  list,
  loadingLabel,
}: {
  children: (page: Page<T>) => ReactNode;
  empty: ReactNode;
  errorTitle: string;
  list: PageState<T>;
  loadingLabel: string;
}) {
  const { hrefWith } = useQueryParams();

  if (list.error) {
    return <ErrorState title={errorTitle} message={list.error} onRetry={list.reload} />;
  }

  if (!list.page) {
    return <LoadingState label={loadingLabel} />;
  }

  const { items, page, page_size: pageSize, total } = list.page;

  if (items.length === 0) {
    return page > 1 ? (
      <EmptyState
        title="Esta página não tem resultados"
        action={
          <Link href={hrefWith({ page: undefined })} className={buttonClass()}>
            Ir para a primeira página
          </Link>
        }
      >
        A lista mudou ou o endereço aponta para uma página que não existe mais.
      </EmptyState>
    ) : (
      empty
    );
  }

  return (
    <>
      {children(list.page)}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        hrefFor={(target) => hrefWith({ page: target > 1 ? target : undefined })}
      />
    </>
  );
}
