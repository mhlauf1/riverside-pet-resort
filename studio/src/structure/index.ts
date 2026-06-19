import {CogIcon, RocketIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import pluralize from 'pluralize-esm'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// Types that get their own pinned/grouped placement below and should NOT appear
// in the default auto-generated document type list.
const DISABLED_TYPES = [
  'settings',
  'schoolSettings',
  'schoolPage',
  'assist.instruction.context',
]

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Website Content')
    .items([
      // Resort documents (page, service, testimonial …) — the default list,
      // minus the singletons and school content placed explicitly below.
      ...S.documentTypeListItems()
        .filter((listItem: any) => !DISABLED_TYPES.includes(listItem.getId()))
        // Pluralize the title of each document type.  This is not required but just an option to consider.
        .map((listItem) => {
          return listItem.title(pluralize(listItem.getTitle() as string))
        }),

      S.divider(),

      // Rio Grooming School — site-within-a-site content grouped together,
      // with its own settings singleton pinned at the top.
      S.listItem()
        .title('Rio Grooming School')
        .icon(RocketIcon)
        .child(
          S.list()
            .title('Rio Grooming School')
            .items([
              S.listItem()
                .title('School Settings')
                .icon(CogIcon)
                .child(
                  S.document().schemaType('schoolSettings').documentId('schoolSettings'),
                ),
              S.divider(),
              S.documentTypeListItem('schoolPage').title('School Pages'),
            ]),
        ),

      S.divider(),

      // Settings Singleton in order to view/edit the one particular document for Settings.  Learn more about Singletons: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
      S.listItem()
        .title('Site Settings')
        .child(S.document().schemaType('settings').documentId('siteSettings'))
        .icon(CogIcon),
    ])
