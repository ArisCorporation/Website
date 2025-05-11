/// <reference types="@directus/extensions/api.d.ts" />

export type DirectusSchema = {
  aliens?: Aliens[];
  asteroid_belts?: AsteroidBelts[];
  chats?: Chats[];
  chats_users?: ChatsUsers[];
  comm_link_channels?: CommLinkChannels[];
  comm_links?: CommLinks[];
  companies?: Companies[];
  companies_headquarter?: CompaniesHeadquarter[];
  company_categories?: CompanyCategories[];
  credits?: Credits;
  departments?: Departments[];
  departments_files?: DepartmentsFiles[];
  directus_access?: DirectusAccess[];
  directus_activity?: DirectusActivity[];
  directus_collections?: DirectusCollections[];
  directus_comments?: DirectusComments[];
  directus_dashboards?: DirectusDashboards[];
  directus_extensions?: DirectusExtensions[];
  directus_fields?: DirectusFields[];
  directus_files?: DirectusFiles[];
  directus_flows?: DirectusFlows[];
  directus_folders?: DirectusFolders[];
  directus_migrations?: DirectusMigrations[];
  directus_notifications?: DirectusNotifications[];
  directus_operations?: DirectusOperations[];
  directus_panels?: DirectusPanels[];
  directus_permissions?: DirectusPermissions[];
  directus_policies?: DirectusPolicies[];
  directus_presets?: DirectusPresets[];
  directus_relations?: DirectusRelations[];
  directus_revisions?: DirectusRevisions[];
  directus_roles?: DirectusRoles[];
  directus_sessions?: DirectusSessions[];
  directus_settings?: DirectusSettings;
  directus_shares?: DirectusShares[];
  directus_sync_id_map?: DirectusSyncIdMap[];
  directus_translations?: DirectusTranslations[];
  directus_users?: DirectusUsers[];
  directus_versions?: DirectusVersions[];
  directus_webhooks?: DirectusWebhooks[];
  fauna?: Fauna[];
  fauna_files?: FaunaFiles[];
  flora?: Flora[];
  flora_index?: FloraIndex;
  footer?: Footer;
  footer_translations?: FooterTranslations[];
  fraction_categories?: FractionCategories[];
  fractions?: Fractions[];
  global_data?: GlobalData;
  home?: Home;
  jumppoints?: Jumppoints[];
  jumppoints_systems?: JumppointsSystems[];
  landing_zones?: LandingZones[];
  languages?: Languages[];
  literature_books?: LiteratureBooks[];
  literature_categories?: LiteratureCategories[];
  messages?: Messages[];
  moons?: Moons[];
  moons_orbit?: MoonsOrbit[];
  one_day_in_history?: OneDayInHistory[];
  partners?: Partners[];
  personal_weapon_attachments?: PersonalWeaponAttachments[];
  personal_weapon_attachments_classifications?: PersonalWeaponAttachmentsClassifications[];
  personal_weapon_attachments_gallery_files?: PersonalWeaponAttachmentsGalleryFiles[];
  personal_weapons?: PersonalWeapons[];
  planets?: Planets[];
  planets_orbit?: PlanetsOrbit[];
  projects?: Projects[];
  release_notes?: ReleaseNotes[];
  release_notes_translations?: ReleaseNotesTranslations[];
  ship_modules?: ShipModules[];
  ship_modules_gallery?: ShipModulesGallery[];
  ship_paints?: ShipPaints[];
  ship_ratings?: ShipRatings[];
  ships?: Ships[];
  ships_commercials?: ShipsCommercials[];
  ships_files?: ShipsFiles[];
  ships_gallery?: ShipsGallery[];
  ships_loaners?: ShipsLoaners[];
  ships_variants?: ShipsVariants[];
  space_stations?: SpaceStations[];
  spectrum_categories?: SpectrumCategories[];
  spectrum_threads?: SpectrumThreads[];
  starmap?: Starmap;
  stars?: Stars[];
  systems?: Systems[];
  systems_orbit?: SystemsOrbit[];
  tasks?: Tasks[];
  tasks_directus_users?: TasksDirectusUsers[];
  tasks_files?: TasksFiles[];
  technologies?: Technologies[];
  test?: Test[];
  timeline_items?: TimelineItems[];
  timeline_items_linked_item?: TimelineItemsLinkedItem[];
  TTA_htmltemplates?: TTAHtmltemplates[];
  uee?: Uee;
  user_hangars?: UserHangars[];
  user_password_reset_tokens?: UserPasswordResetTokens[];
  user_wishlists?: UserWishlists[];
  verse_exkurs?: VerseExkurs;
};

export type Aliens = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  tabs?: unknown | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type AsteroidBelts = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Chats = {
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  messages?: any[] | Messages[];
  sort_date?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
  users?: any[] | ChatsUsers[];
};

export type ChatsUsers = {
  chat_id?: string | Chats | null;
  id?: number;
  user_id?: string | DirectusUsers | null;
};

export type CommLinkChannels = {
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  id?: string;
  name?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type CommLinks = {
  banner?: string | DirectusFiles | null;
  channel?: string | CommLinkChannels | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Companies = {
  articles?: string;
  banner?: string | DirectusFiles | null;
  category?: string | CompanyCategories | null;
  code?: string | null;
  content?: string | null;
  current_ceo?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  famous_goods?: string | null;
  founded?: string | null;
  founder?: string | null;
  headquarter?: any[] | CompaniesHeadquarter[];
  id?: string;
  infobox?: string;
  logo?: string | DirectusFiles | null;
  logo_background?: string | DirectusFiles | null;
  name?: string | null;
  personal_weapon_attachments?: any[] | PersonalWeaponAttachments[];
  personal_weapons?: any[] | PersonalWeapons[];
  ship_modules?: any[] | ShipModules[];
  ships?: any[] | Ships[];
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type CompaniesHeadquarter = {
  collection?: string | null;
  company_id?: string | Companies | null;
  headquarter?: string | any | null;
  id?: number;
};

export type CompanyCategories = {
  companies?: any[] | Companies[];
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  sort?: number | null;
  sub_categories?: any[] | CompanyCategories[];
  superior_category?: string | CompanyCategories | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Credits = {
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Departments = {
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  employees?: any[] | DirectusUsers[];
  gallery?: any[] | DepartmentsFiles[];
  head_of_department?: any[] | DirectusUsers[];
  id?: string;
  logo?: string | DirectusFiles | null;
  name?: string | null;
  ships?: any[] | UserHangars[];
  slug?: string | null;
  status?: string;
  store_image?: string | DirectusFiles | null;
  tab_id?: number | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type DepartmentsFiles = {
  departments_id?: string | Departments | null;
  directus_files_id?: string | DirectusFiles | null;
  id?: number;
  sort?: number | null;
};

export type DirectusAccess = {
  id?: string;
  policy?: string | DirectusPolicies;
  role?: string | DirectusRoles | null;
  sort?: number | null;
  user?: string | DirectusUsers | null;
};

export type DirectusActivity = {
  action?: string;
  collection?: string;
  id?: number;
  ip?: string | null;
  item?: string;
  origin?: string | null;
  revisions?: any[] | DirectusRevisions[];
  timestamp?: string;
  user?: string | DirectusUsers | null;
  user_agent?: string | null;
};

export type DirectusCollections = {
  accountability?: string | null;
  archive_app_filter?: boolean;
  archive_field?: string | null;
  archive_value?: string | null;
  collapse?: string;
  collection?: string;
  color?: string | null;
  display_template?: string | null;
  group?: string | DirectusCollections | null;
  hidden?: boolean;
  icon?: string | null;
  item_duplication_fields?: unknown | null;
  note?: string | null;
  preview_url?: string | null;
  singleton?: boolean;
  sort?: number | null;
  sort_field?: string | null;
  translations?: unknown | null;
  unarchive_value?: string | null;
  versioning?: boolean;
};

export type DirectusComments = {
  collection?: string | DirectusCollections;
  comment?: string;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  item?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type DirectusDashboards = {
  color?: string | null;
  date_created?: string | null;
  icon?: string;
  id?: string;
  name?: string;
  note?: string | null;
  panels?: any[] | DirectusPanels[];
  user_created?: string | DirectusUsers | null;
};

export type DirectusExtensions = {
  bundle?: string | null;
  enabled?: boolean;
  folder?: string;
  id?: string;
  source?: string;
};

export type DirectusFields = {
  collection?: string | DirectusCollections;
  conditions?: unknown | null;
  display?: string | null;
  display_options?: unknown | null;
  field?: string;
  group?: string | DirectusFields | null;
  hidden?: boolean;
  id?: number;
  interface?: string | null;
  note?: string | null;
  options?: unknown | null;
  readonly?: boolean;
  required?: boolean | null;
  sort?: number | null;
  special?: unknown | null;
  translations?: unknown | null;
  validation?: unknown | null;
  validation_message?: string | null;
  width?: string | null;
};

export type DirectusFiles = {
  charset?: string | null;
  created_on?: string;
  description?: string | null;
  duration?: number | null;
  embed?: string | null;
  filename_disk?: string | null;
  filename_download?: string;
  filesize?: number | null;
  focal_point_x?: number | null;
  focal_point_y?: number | null;
  folder?: string | DirectusFolders | null;
  height?: number | null;
  id?: string;
  location?: string | null;
  metadata?: unknown | null;
  modified_by?: string | DirectusUsers | null;
  modified_on?: string;
  storage?: string;
  tags?: unknown | null;
  title?: string | null;
  tus_data?: unknown | null;
  tus_id?: string | null;
  type?: string | null;
  uploaded_by?: string | DirectusUsers | null;
  uploaded_on?: string | null;
  width?: number | null;
};

export type DirectusFlows = {
  accountability?: string | null;
  color?: string | null;
  date_created?: string | null;
  description?: string | null;
  flow_manager_category?: string | null;
  flow_manager_last_run_at?: string | null;
  flow_manager_order?: number | null;
  flow_manager_run_counter?: number | null;
  icon?: string | null;
  id?: string;
  name?: string;
  operation?: string | DirectusOperations | null;
  operations?: any[] | DirectusOperations[];
  options?: unknown | null;
  status?: string;
  trigger?: string | null;
  user_created?: string | DirectusUsers | null;
};

export type DirectusFolders = {
  id?: string;
  name?: string;
  parent?: string | DirectusFolders | null;
};

export type DirectusMigrations = {
  name?: string;
  timestamp?: string | null;
  version?: string;
};

export type DirectusNotifications = {
  collection?: string | null;
  id?: number;
  item?: string | null;
  message?: string | null;
  recipient?: string | DirectusUsers;
  sender?: string | DirectusUsers | null;
  status?: string | null;
  subject?: string;
  timestamp?: string | null;
};

export type DirectusOperations = {
  date_created?: string | null;
  flow?: string | DirectusFlows;
  id?: string;
  key?: string;
  name?: string | null;
  options?: unknown | null;
  position_x?: number;
  position_y?: number;
  reject?: string | DirectusOperations | null;
  resolve?: string | DirectusOperations | null;
  type?: string;
  user_created?: string | DirectusUsers | null;
};

export type DirectusPanels = {
  color?: string | null;
  dashboard?: string | DirectusDashboards;
  date_created?: string | null;
  height?: number;
  icon?: string | null;
  id?: string;
  name?: string | null;
  note?: string | null;
  options?: unknown | null;
  position_x?: number;
  position_y?: number;
  show_header?: boolean;
  type?: string;
  user_created?: string | DirectusUsers | null;
  width?: number;
};

export type DirectusPermissions = {
  action?: string;
  collection?: string;
  fields?: unknown | null;
  id?: number;
  permissions?: unknown | null;
  policy?: string | DirectusPolicies;
  presets?: unknown | null;
  validation?: unknown | null;
};

export type DirectusPolicies = {
  admin_access?: boolean;
  app_access?: boolean;
  description?: string | null;
  enforce_tfa?: boolean;
  icon?: string;
  id?: string;
  ip_access?: unknown | null;
  name?: string;
  permissions?: any[] | DirectusPermissions[];
  roles?: any[] | DirectusAccess[];
  users?: any[] | DirectusAccess[];
};

export type DirectusPresets = {
  bookmark?: string | null;
  collection?: string | null;
  color?: string | null;
  filter?: unknown | null;
  icon?: string | null;
  id?: number;
  layout?: string | null;
  layout_options?: unknown | null;
  layout_query?: unknown | null;
  refresh_interval?: number | null;
  role?: string | DirectusRoles | null;
  search?: string | null;
  user?: string | DirectusUsers | null;
};

export type DirectusRelations = {
  id?: number;
  junction_field?: string | null;
  many_collection?: string;
  many_field?: string;
  one_allowed_collections?: unknown | null;
  one_collection?: string | null;
  one_collection_field?: string | null;
  one_deselect_action?: string;
  one_field?: string | null;
  sort_field?: string | null;
};

export type DirectusRevisions = {
  activity?: number | DirectusActivity;
  collection?: string;
  data?: unknown | null;
  delta?: unknown | null;
  id?: number;
  item?: string;
  parent?: number | DirectusRevisions | null;
  version?: string | DirectusVersions | null;
};

export type DirectusRoles = {
  access_level?: number | null;
  children?: any[] | DirectusRoles[];
  description?: string | null;
  icon?: string;
  id?: string;
  label?: string | null;
  name?: string;
  parent?: string | DirectusRoles | null;
  policies?: any[] | DirectusAccess[];
  users?: any[] | DirectusUsers[];
  users_group?: string;
};

export type DirectusSessions = {
  expires?: string;
  ip?: string | null;
  next_token?: string | null;
  origin?: string | null;
  share?: string | DirectusShares | null;
  token?: string;
  user?: string | DirectusUsers | null;
  user_agent?: string | null;
};

export type DirectusSettings = {
  auth_login_attempts?: number | null;
  auth_password_policy?: string | null;
  basemaps?: unknown | null;
  command_palette_settings?: unknown | null;
  custom_aspect_ratios?: unknown | null;
  custom_css?: string | null;
  default_appearance?: string;
  default_language?: string;
  default_theme_dark?: string | null;
  default_theme_light?: string | null;
  flow_manager_categories?: unknown | null;
  id?: number;
  mapbox_key?: string | null;
  module_bar?: unknown | null;
  project_color?: string;
  project_descriptor?: string | null;
  project_logo?: string | DirectusFiles | null;
  project_name?: string;
  project_url?: string | null;
  public_background?: string | DirectusFiles | null;
  public_favicon?: string | DirectusFiles | null;
  public_foreground?: string | DirectusFiles | null;
  public_note?: string | null;
  public_registration?: boolean;
  public_registration_email_filter?: unknown | null;
  public_registration_role?: string | DirectusRoles | null;
  public_registration_verify_email?: boolean;
  report_bug_url?: string | null;
  report_error_url?: string | null;
  report_feature_url?: string | null;
  storage_asset_presets?: unknown | null;
  storage_asset_transform?: string | null;
  storage_default_folder?: string | DirectusFolders | null;
  theme_dark_overrides?: unknown | null;
  theme_light_overrides?: unknown | null;
  theming_group?: string;
  TTA_KEY?: string | null;
  visual_editor_urls?: unknown | null;
};

export type DirectusShares = {
  collection?: string | DirectusCollections;
  date_created?: string | null;
  date_end?: string | null;
  date_start?: string | null;
  id?: string;
  item?: string;
  max_uses?: number | null;
  name?: string | null;
  password?: string | null;
  role?: string | DirectusRoles | null;
  times_used?: number | null;
  user_created?: string | DirectusUsers | null;
};

export type DirectusSyncIdMap = {
  created_at?: string | null;
  id?: number;
  local_id?: string;
  sync_id?: string;
  table?: string;
};

export type DirectusTranslations = {
  id?: string;
  key?: string;
  language?: string;
  value?: string;
};

export type DirectusUsers = {
  activities?: string | null;
  alcohol?: string | null;
  api_account?: boolean | null;
  appearance?: string | null;
  ariscorp_data?: string;
  assigned_tasks?: any[] | TasksDirectusUsers[];
  auth_data?: unknown | null;
  avatar?: string | DirectusFiles | null;
  bio?: string;
  biography?: string | null;
  birthdate?: string | null;
  birthplace?: string | LandingZones | null;
  books?: string | null;
  character_trait?: string | null;
  characteristics?: string;
  chats?: string | Chats | null;
  citizen?: boolean | null;
  citizen_reason?: string | null;
  clothing?: string | null;
  colors?: string | null;
  contact_email?: string | null;
  current_residence?: string | LandingZones | null;
  date_created?: string | null;
  department?: string | Departments | null;
  description?: string | null;
  discord_id?: string | null;
  discord_name?: string | null;
  drink?: string | null;
  duty_division?: string | null;
  duty_end?: string | null;
  duty_period?: string | null;
  duty_state?: boolean | null;
  education_name?: string | null;
  education_period?: string | null;
  education_state?: boolean | null;
  email?: string | null;
  email_notifications?: boolean | null;
  external_identifier?: string | null;
  eye_color?: string | null;
  fears?: string | null;
  first_name?: string | null;
  food?: string | null;
  habits?: string | null;
  hair_color?: string | null;
  hangar_items?: any[] | UserHangars[];
  hates?: string | null;
  head_of_department?: boolean | null;
  height?: number | null;
  hidden?: boolean | null;
  hobbies?: string | null;
  id?: string;
  language?: string | null;
  last_access?: string | null;
  last_name?: string | null;
  last_page?: string | null;
  leading_department?: string | Departments | null;
  location?: string | null;
  loves?: string | null;
  medical_informations?: string | null;
  movies?: string | null;
  music?: string | null;
  mysterious_things?: string | null;
  onboarded?: boolean | null;
  onboardings?: unknown | null;
  password?: string | null;
  password_reset_tokens?: any[] | UserPasswordResetTokens[];
  policies?: any[] | DirectusAccess[];
  provider?: string;
  role?: string | DirectusRoles | null;
  roles?: unknown | null;
  rsi_handle?: string | null;
  sex?: string | null;
  slug?: string | null;
  social_state?: boolean | null;
  status?: string;
  tags?: unknown | null;
  talents?: string | null;
  temporary_password?: boolean | null;
  tfa_secret?: string | null;
  theme_dark?: string | null;
  theme_dark_overrides?: unknown | null;
  theme_light?: string | null;
  theme_light_overrides?: unknown | null;
  tics?: string | null;
  title?: string | null;
  token?: string | null;
  user_preferences?: unknown | null;
  weight?: number | null;
  wishlist_items?: any[] | UserWishlists[];
  label?: string
};

export type DirectusVersions = {
  collection?: string | DirectusCollections;
  date_created?: string | null;
  date_updated?: string | null;
  delta?: unknown | null;
  hash?: string | null;
  id?: string;
  item?: string;
  key?: string;
  name?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type DirectusWebhooks = {
  actions?: unknown;
  collections?: unknown;
  data?: boolean;
  headers?: unknown | null;
  id?: number;
  method?: string;
  migrated_flow?: string | DirectusFlows | null;
  name?: string;
  status?: string;
  url?: string;
  was_active_before_deprecation?: boolean;
};

export type Fauna = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  gallery?: any[] | FaunaFiles[];
  id?: string;
  name?: string | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type FaunaFiles = {
  directus_files_id?: string | DirectusFiles | null;
  fauna_id?: string | Fauna | null;
  id?: number;
  sort?: number | null;
};

export type Flora = {
  banner?: string | DirectusFiles | null;
  category?: string | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type FloraIndex = {
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Footer = {
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  translations?: any[] | FooterTranslations[];
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type FooterTranslations = {
  content?: string | null;
  footer_id?: string | Footer | null;
  id?: number;
  languages_code?: string | Languages | null;
};

export type FractionCategories = {
  date_created?: string | null;
  date_updated?: string | null;
  fractions?: any[] | Fractions[];
  id?: string;
  name?: string | null;
  sort?: number | null;
  sub_categories?: any[] | FractionCategories[];
  superior_category?: string | FractionCategories | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Fractions = {
  banner?: string | DirectusFiles | null;
  category?: string | FractionCategories | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  logo?: string | DirectusFiles | null;
  name?: string | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type GlobalData = {
  date_created?: string | null;
  date_updated?: string | null;
  discord_link?: string | null;
  id?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Home = {
  ariscorp_charta?: string | null;
  ariscorp_description?: string | null;
  ariscorp_history?: string | null;
  ariscorp_manifest?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  "tabs-l1d_de"?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Jumppoints = {
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  size?: string | null;
  systems?: any[] | JumppointsSystems[];
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type JumppointsSystems = {
  id?: number;
  jumppoints_id?: string | Jumppoints | null;
  systems_id?: string | Systems | null;
};

export type LandingZones = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  moon?: string | Moons | null;
  name?: string | null;
  planet?: string | Planets | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Languages = {
  code?: string;
  date_created?: string | null;
  date_updated?: string | null;
  direction?: string | null;
  name?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type LiteratureBooks = {
  category?: string | LiteratureCategories | null;
  chapter?: number | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type LiteratureCategories = {
  author?: string | null;
  banner?: string | DirectusFiles | null;
  books?: any[] | LiteratureBooks[];
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  protagonist?: string | null;
  slug?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Messages = {
  chat?: string | Chats | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  text?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Moons = {
  "accordion-0p1dwu"?: string;
  age?: number | null;
  astronomical_data?: string;
  astronomical_designation?: string | null;
  banner?: string | DirectusFiles | null;
  content?: string | null;
  danger_level?: number | null;
  date_created?: string | null;
  date_updated?: string | null;
  distance?: number | null;
  economy?: number | null;
  fairchanceact?: boolean | null;
  habitable?: boolean | null;
  id?: string;
  landing_zones?: any[] | LandingZones[];
  name?: string | null;
  orbit?: any[] | MoonsOrbit[];
  orbital_period?: number | null;
  planet?: string | Planets | null;
  political_economy?: string;
  population?: number | null;
  size?: number | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type MoonsOrbit = {
  collection?: string | null;
  id?: number;
  moon_id?: string | Moons | null;
  object?: string | any | null;
  sort?: number | null;
};

export type OneDayInHistory = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  slug?: string | null;
  status?: string;
  title?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Partners = {
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  logo?: string | DirectusFiles | null;
  name?: string | null;
  status?: string;
  url?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type PersonalWeaponAttachments = {
  auto_zeroing?: boolean | null;
  barrels?: string;
  category?: string | null;
  classification?: string | PersonalWeaponAttachmentsClassifications | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  gallery?: any[] | PersonalWeaponAttachmentsGalleryFiles[];
  id?: string;
  magazine?: string;
  manufacturer?: string | Companies | null;
  max_rounds?: number | null;
  name?: string | null;
  price?: number | null;
  rangefinder?: boolean | null;
  sight?: string;
  size?: string | null;
  slug?: string | null;
  statistic?: unknown | null;
  store_image?: string | DirectusFiles | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
  weight?: number | null;
  zeroing_range?: number | null;
  zoom_level?: string | null;
};

export type PersonalWeaponAttachmentsClassifications = {
  classification?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  personal_weapon_attachments?: any[] | PersonalWeaponAttachments[];
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type PersonalWeaponAttachmentsGalleryFiles = {
  directus_files_id?: string | DirectusFiles | null;
  id?: number;
  personal_weapon_attachments_id?: string | PersonalWeaponAttachments | null;
  sort?: number | null;
};

export type PersonalWeapons = {
  calibre?: number | null;
  classification?: string | null;
  content?: string | null;
  damage_type?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  effective_range?: string | null;
  fire_modes?: unknown | null;
  fire_rates?: unknown | null;
  id?: string;
  locktime?: number | null;
  magazine?: string | PersonalWeaponAttachments | null;
  manufacturer?: string | Companies | null;
  max_range?: number | null;
  muzzle_velocity?: number | null;
  name?: string | null;
  sight?: string | PersonalWeaponAttachments | null;
  slug?: string | null;
  statistics?: unknown | null;
  store_image?: string | DirectusFiles | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
  weight?: number | null;
};

export type Planets = {
  "accordion-ivoza6"?: string;
  age?: number | null;
  astronomical_data?: string;
  astronomical_designation?: string | null;
  banner?: string | DirectusFiles | null;
  content?: string | null;
  danger_level?: number | null;
  date_created?: string | null;
  date_updated?: string | null;
  distance?: number | null;
  economy?: number | null;
  fairchanceact?: boolean | null;
  habitable?: boolean | null;
  id?: string;
  landing_zones?: any[] | LandingZones[];
  name?: string | null;
  orbit?: any[] | PlanetsOrbit[];
  orbital_period?: number | null;
  political_economy?: string;
  population?: number | null;
  size?: number | null;
  slug?: string | null;
  star_system?: string | Systems | null;
  status?: string;
  type?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type PlanetsOrbit = {
  collection?: string | null;
  id?: number;
  object?: string | any | null;
  planet_id?: string | Planets | null;
  sort?: number | null;
};

export type Projects = {
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  id?: string;
  name?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type ReleaseNotes = {
  banner?: string | DirectusFiles | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  status?: string;
  translations?: any[] | ReleaseNotesTranslations[];
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
  version?: string | null;
};

export type ReleaseNotesTranslations = {
  content?: string | null;
  id?: number;
  languages_code?: string | Languages | null;
  name?: string | null;
  release_notes_id?: string | ReleaseNotes | null;
};

export type ShipModules = {
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  gallery?: any[] | ShipModulesGallery[];
  id?: string;
  manufacturer?: string | Companies | null;
  name?: string | null;
  pledge_price?: number | null;
  price?: number | null;
  production_status?: string | null;
  ship?: string | Ships | null;
  slug?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type ShipModulesGallery = {
  directus_file_id?: string | DirectusFiles | null;
  id?: number;
  ship_module_id?: string | ShipModules | null;
  sort?: number | null;
};

export type ShipPaints = {
  id?: number;
  name?: string | null;
  ship?: string | Ships | null;
  slug?: string | null;
  store_image?: string | DirectusFiles | null;
};

export type ShipRatings = {
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  introduction?: string | null;
  ratings?: unknown | null;
  ships?: any[] | Ships[];
  status?: string;
  strengths_and_weaknesses?: unknown | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Ships = {
  "3d_models"?: any[] | ShipsFiles[];
  acceleration_main?: number | null;
  acceleration_maneuvering?: number | null;
  acceleration_retro?: number | null;
  acceleration_vtol?: number | null;
  api_ids?: string;
  base_data?: string;
  beam?: number | null;
  brochure?: string | DirectusFiles | null;
  cargo?: number | null;
  categorization?: string;
  classification?: string | null;
  commercial?: string | DirectusFiles | null;
  commercial_video_id?: string | null;
  commercials?: any[] | ShipsCommercials[];
  coolers?: unknown | null;
  crew?: string;
  crew_max?: string | null;
  crew_min?: number | null;
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  dimensions?: string;
  erkul_id?: string | null;
  field_overwrite?: unknown | null;
  files?: string;
  fl_id?: string | null;
  focuses?: unknown | null;
  gallery?: any[] | ShipsGallery[];
  gravlev?: boolean | null;
  ground?: boolean | null;
  height?: number | null;
  history?: string | null;
  hologram?: string | DirectusFiles | null;
  hydrogen_fuel_tanks?: unknown | null;
  id?: string;
  insurance_claim_time?: number | null;
  insurance_data?: string;
  insurance_expedited_cost?: number | null;
  insurance_expedited_time?: number | null;
  length?: number | null;
  live_patch?: string | null;
  loaners?: any[] | ShipsLoaners[];
  main_thrusters?: unknown | null;
  maneuvering_thrusters?: unknown | null;
  manned_turrets?: unknown | null;
  manufacturer?: string | Companies | null;
  mass?: number | null;
  max_to_zero?: number | null;
  modules?: any[] | ShipModules[];
  name?: string | null;
  on_sale?: boolean | null;
  ownable?: boolean | null;
  p4k_id?: string | null;
  p4k_mode?: boolean | null;
  p4k_name?: string | null;
  p4k_version?: string | null;
  paints?: any[] | ShipPaints[];
  pilot_hardpoints?: unknown | null;
  pitch?: number | null;
  pledge_price?: number | null;
  ports?: string;
  power_plants?: unknown | null;
  price?: number | null;
  production_note?: string | null;
  production_status?: string | null;
  quantum_drives?: unknown | null;
  quantum_fuel_tanks?: unknown | null;
  rating?: string | ShipRatings | null;
  remote_turrets?: unknown | null;
  retro_thrusters?: unknown | null;
  roll?: number | null;
  sales_url?: string | null;
  scm_to_zero?: number | null;
  shields?: unknown | null;
  size?: string | null;
  size_label?: string | null;
  slug?: string | null;
  sm_id?: number | null;
  speed_max?: number | null;
  speed_scm?: number | null;
  starter_ship?: boolean | null;
  status?: string;
  store_image?: string | DirectusFiles | null;
  store_url?: string | null;
  tabs?: string;
  "tabs--zj795"?: string;
  tank_size_hydrogen?: number | null;
  tank_size_quantum?: number | null;
  tanks?: string;
  user_created?: string | DirectusUsers | null;
  user_hangars?: any[] | UserHangars[];
  user_updated?: string | DirectusUsers | null;
  user_wishlists?: any[] | UserWishlists[];
  variants?: any[] | ShipsVariants[];
  velocity?: string;
  vtol_thrusters?: unknown | null;
  yaw?: number | null;
  zero_to_max?: number | null;
  zero_to_scm?: number | null;
};

export type ShipsCommercials = {
  commercial_id?: string | DirectusFiles | null;
  id?: number;
  ship_id?: string | Ships | null;
};

export type ShipsFiles = {
  directus_files_id?: string | DirectusFiles | null;
  id?: number;
  ships_id?: string | Ships | null;
};

export type ShipsGallery = {
  directus_files_id?: string | DirectusFiles | null;
  id?: number;
  ships_id?: string | Ships | null;
  sort?: number | null;
};

export type ShipsLoaners = {
  id?: number;
  loaner_id?: string | Ships | null;
  ship_id?: string | Ships | null;
};

export type ShipsVariants = {
  id?: number;
  ship_id?: string | Ships | null;
  variant_id?: string | Ships | null;
};

export type SpaceStations = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  type?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type SpectrumCategories = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  threads?: any[] | SpectrumThreads[];
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type SpectrumThreads = {
  banner?: string | DirectusFiles | null;
  category?: string | SpectrumCategories | null;
  chapter?: number | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Starmap = {
  borders?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  distances?: string | null;
  history?: unknown | null;
  history_group?: string;
  history_introduction?: string | null;
  id?: string;
  jumppoint_connections?: string | null;
  "tabs-xprykd"?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Stars = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  name?: string | null;
  size?: string | null;
  slug?: string | null;
  type?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Systems = {
  "accordion-odtwbd"?: string;
  affiliation?: string | null;
  astronomic?: string;
  banner?: string | DirectusFiles | null;
  celestial_objects?: string;
  content?: string | null;
  danger_level?: number | null;
  date_created?: string | null;
  date_updated?: string | null;
  discovery_year?: number | null;
  economy?: number | null;
  id?: string;
  industry_and_commerce?: string;
  jumppoints?: any[] | JumppointsSystems[];
  live_status?: boolean | null;
  military_classified?: boolean | null;
  name?: string | null;
  orbit?: any[] | SystemsOrbit[];
  overview_image?: string | DirectusFiles | null;
  planets?: any[] | Planets[];
  population?: number | null;
  size?: number | null;
  slug?: string | null;
  star_class?: string | null;
  star_type?: string | null;
  starmap_id?: string | null;
  starmap_position_left?: number | null;
  starmap_position_top?: number | null;
  status?: string;
  tsb?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
  whisper_in_the_wind?: string | null;
};

export type SystemsOrbit = {
  collection?: string | null;
  id?: number;
  object?: string | any | null;
  sort?: number | null;
  system_id?: string | Systems | null;
};

export type Tasks = {
  assigned_to?: any[] | TasksDirectusUsers[];
  banner?: string | DirectusFiles | null;
  comments?: string;
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  files?: any[] | TasksFiles[];
  id?: string;
  parent_task?: string | Tasks | null;
  project?: string | Projects | null;
  sort?: number | null;
  status?: string | null;
  sub_tasks?: any[] | Tasks[];
  tags?: unknown | null;
  title?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type TasksDirectusUsers = {
  directus_users_id?: string | DirectusUsers | null;
  id?: number;
  tasks_id?: string | Tasks | null;
};

export type TasksFiles = {
  directus_files_id?: string | DirectusFiles | null;
  id?: number;
  tasks_id?: string | Tasks | null;
};

export type Technologies = {
  banner?: string | DirectusFiles | null;
  category?: string | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  description?: string | null;
  icon?: string | DirectusFiles | null;
  id?: string;
  name?: string | null;
  slug?: string | null;
  status?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type Test = {
  id?: string;
};

export type TimelineItems = {
  banner?: string | DirectusFiles | null;
  category?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  dates?: unknown | null;
  description?: string | null;
  id?: string;
  linked_item?: any[] | TimelineItemsLinkedItem[];
  old?: string | null;
  old2?: string | null;
  old3?: string | null;
  title?: string | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type TimelineItemsLinkedItem = {
  collection?: string | null;
  id?: number;
  item?: string | any | null;
  timeline_items_id?: string | TimelineItems | null;
};

export type TTAHtmltemplates = {
  collection?: string | null;
  description?: string | null;
  footer?: string | null;
  format?: string | null;
  header?: string | null;
  id?: number;
  name?: string | null;
  orientation?: string | null;
  template?: string | null;
};

export type Uee = {
  banner?: string | DirectusFiles | null;
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  holidays?: unknown | null;
  id?: string;
  tabs?: unknown | null;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
};

export type UserHangars = {
  active_module?: string | ShipModules | null;
  date_created?: string | null;
  department?: string | Departments | null;
  group?: string | null;
  id?: number;
  name?: string | null;
  name_public?: boolean | null;
  planned?: boolean | null;
  serial?: string | null;
  ship_id?: string | Ships | null;
  user_id?: string | DirectusUsers | null;
  visibility?: string | null;
};

export type UserPasswordResetTokens = {
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  token?: string | null;
  user?: string | DirectusUsers;
};

export type UserWishlists = {
  id?: number;
  ship_id?: string | Ships | null;
  user_id?: string | DirectusUsers | null;
};

export type VerseExkurs = {
  content?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id?: string;
  sources?: unknown | null;
  test?: string;
  user_created?: string | DirectusUsers | null;
  user_updated?: string | DirectusUsers | null;
  ve_links?: unknown | null;
};
