import path from 'path'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { en } from 'payload/i18n/en'
import { de } from 'payload/i18n/de'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { WineItem } from 'collections/wine-item'
import { ClothingCategories } from 'collections/clothing-categories'
import { ClothingItem } from 'collections/clothing-item'
import { FoodItem } from 'collections/food-item'
import { Header } from 'global/header/schema'
import { Footer } from 'global/footer/schema'
import { Hero } from 'global/hero/schema'
import { EventItem } from 'collections/events'
import { Producer } from 'collections/producer'
import init from 'init'
import { EventRoom } from 'global/event-room/schema'
import { About } from 'global/about/schema'
import { Contact } from 'global/contact/schema'
import { MenuType } from 'collections/menu-type'
import { NormalItem } from 'collections/normal-item'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  editor: slateEditor({}),
  globals: [
    Header,
    Hero,
    EventRoom,
    About,
    Contact,
    Footer,
  ],
  collections: [
    Producer,
    EventItem,
    MenuType,
    WineItem,
    NormalItem,
    FoodItem,
    ClothingCategories,
    ClothingItem,
    {
      slug: 'users',
      auth: true,
      access: {
        delete: () => false,
        update: () => false,
      },
      fields: [],
    },
    {
      slug: 'media',
      upload: true,
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
    },
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URI || ''
    }
  }),

  /**
   * Payload can now accept specific translations from 'payload/i18n/en'
   * This is completely optional and will default to English if not provided
   */
  i18n: {
    supportedLanguages: { en, de },
  },
  localization: {
    locales: ['en', 'de'],
    defaultLocale: 'de',
    fallback: true,
  },

  admin: {
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
      prefillOnly: true,
    },
  },
  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
        },
      })
    }
    await init(payload)
  },
  sharp,
})
