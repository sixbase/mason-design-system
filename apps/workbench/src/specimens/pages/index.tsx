import type { ComponentType } from 'react';
import { PAGE_BASE, PageChrome } from './PageChrome';
import { AccountDemo } from './AccountDemo';
import { CartDemo } from './CartDemo';
import { CollectionDemo } from './CollectionDemo';
import { HomepageDemo } from './HomepageDemo';
import { PDPDemo } from './PDPDemo';
import { SaleDemo } from './SaleDemo';
import { SearchDemo } from './SearchDemo';
import { TermsDemo } from './TermsDemo';

type Demo = ComponentType<{ basePath?: string }>;

const wrap = (Demo: Demo, page: string): ComponentType =>
  function Page() {
    return (
      <PageChrome page={page}>
        <Demo basePath={PAGE_BASE} />
      </PageChrome>
    );
  };

export const PAGE_SPECIMENS: Record<string, ComponentType> = {
  'page/homepage': wrap(HomepageDemo, 'homepage'),
  'page/product-detail': wrap(PDPDemo, 'product-detail'),
  'page/collection': wrap(CollectionDemo, 'collection'),
  'page/cart': wrap(CartDemo, 'cart'),
  'page/search': wrap(SearchDemo, 'search'),
  'page/sale': wrap(SaleDemo, 'sale'),
  'page/account': wrap(AccountDemo, 'account'),
  'page/terms': wrap(TermsDemo, 'terms'),
};
