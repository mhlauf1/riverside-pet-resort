import {GetPageQueryResult, GetSchoolPageQueryResult} from '@/sanity.types'

type PageBuilderSource = GetPageQueryResult | GetSchoolPageQueryResult

export type PageBuilderSection = NonNullable<NonNullable<PageBuilderSource>['pageBuilder']>[number]
export type ExtractPageBuilderType<T extends PageBuilderSection['_type']> = Extract<
  PageBuilderSection,
  {_type: T}
>

// Represents a Link after GROQ dereferencing (page becomes slug string)
export type DereferencedLink = {
  _type: 'link'
  linkType?: string
  href?: string
  page?: string | null
  pageType?: string | null
  queryString?: string
  openInNewTab?: boolean
}
