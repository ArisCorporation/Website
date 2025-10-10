export interface Alien {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	content?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	tabs?: Array<{ title: string; content: string }> | null;
}

export interface AmsDashboard {
	/** @primaryKey */
	id: number;
}

export interface AriscorpEvent {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	type?: 'employee' | 'website_update' | 'verseexkurs_update' | 'shipexkurs_update' | 'comm_link_published' | null;
	name?: string | null;
	description?: string | null;
	link?: string | null;
	item?: AriscorpEventsItem[] | string[];
}

export interface AriscorpEventsItem {
	/** @primaryKey */
	id: number;
	ariscorp_event_id?: AriscorpEvent | string | null;
	item?: DirectusUser | string | null;
	collection?: string | null;
}

export interface AsteroidBelt {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	banner?: DirectusFile | string | null;
	name?: string | null;
	slug?: string | null;
	content?: string | null;
}

export interface BingoCollection {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @description Es müssen mindestens 24 Karten sein, damit dass Bingo funktioniert!! */
	cards?: string[] | null;
	title?: string | null;
	free_card?: string | null;
	description?: string | null;
}

export interface BingoGame {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	collection?: BingoCollection | string | null;
	board?: 'json' | null;
}

export interface Chat {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	sort_date?: string | null;
	messages?: Message[] | string[];
	users?: ChatsUser[] | string[];
}

export interface ChatsUser {
	/** @primaryKey */
	id: number;
	chat_id?: Chat | string | null;
	user_id?: DirectusUser | string | null;
}

export interface CommLinkChannel {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	description?: string | null;
}

export interface CommLink {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	description?: string | null;
	content?: string | null;
	channel?: CommLinkChannel | string | null;
	name?: string | null;
	date_published?: string | null;
}

export interface Company {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	logo?: DirectusFile | string | null;
	content?: string | null;
	/** @required */
	category: CompanyCategory | string;
	code?: string | null;
	current_ceo?: string | null;
	founded?: string | null;
	founder?: string | null;
	famous_goods?: string | null;
	logo_background?: DirectusFile | string | null;
	ship_modules?: ShipModule[] | string[];
	personal_weapons?: PersonalWeapon[] | string[];
	personal_weapon_attachments?: PersonalWeaponAttachment[] | string[];
	ships?: Ship[] | string[];
	headquarter?: CompaniesHeadquarter[] | string[];
}

export interface CompaniesHeadquarter {
	/** @primaryKey */
	id: number;
	company_id?: Company | string | null;
	headquarter?: LandingZone | System | Planet | Moon | SpaceStation | string | null;
	collection?: string | null;
}

export interface CompanyCategory {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	superior_category?: CompanyCategory | string | null;
	sort?: number | null;
	sub_categories?: CompanyCategory[] | string[];
	companies?: Company[] | string[];
}

export interface Credits {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	content?: string | null;
}

export interface Department {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	logo?: DirectusFile | string | null;
	name?: string | null;
	slug?: string | null;
	description?: string | null;
	tab_id?: number | null;
	store_image?: DirectusFile | string | null;
	head_of_department?: DirectusUser[] | string[];
	ships?: UserHangar[] | string[];
	gallery?: DepartmentsFile[] | string[];
	primary_employees?: DirectusUser[] | string[];
	secondary_employees?: DirectusUser[] | string[];
}

export interface DepartmentsFile {
	/** @primaryKey */
	id: number;
	departments_id?: Department | string | null;
	directus_files_id?: DirectusFile | string | null;
	sort?: number | null;
}

export interface Fauna {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	content?: string | null;
	gallery?: FaunaFile[] | string[];
}

export interface FaunaFile {
	/** @primaryKey */
	id: number;
	fauna_id?: Fauna | string | null;
	directus_files_id?: DirectusFile | string | null;
	sort?: number | null;
}

export interface Flora {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	category?: 'plant' | 'collectible' | null;
	content?: string | null;
}

export interface FloraIndex {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	content?: string | null;
}

export interface Footer {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	translations?: FooterTranslation[] | null;
}

export interface FooterTranslation {
	/** @primaryKey */
	id: number;
	footer_id?: Footer | string | null;
	languages_code?: Language | string | null;
	content?: string | null;
}

export interface FractionCategory {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	superior_category?: FractionCategory | string | null;
	sort?: number | null;
	sub_categories?: FractionCategory[] | string[];
	fractions?: Fraction[] | string[];
}

export interface Fraction {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	logo?: DirectusFile | string | null;
	banner?: DirectusFile | string | null;
	content?: string | null;
	category?: FractionCategory | string | null;
}

export interface GlobalData {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	discord_link?: string | null;
}

export interface Home {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	ariscorp_description?: string | null;
	ariscorp_history?: string | null;
	ariscorp_manifest?: string | null;
	ariscorp_charta?: string | null;
}

export interface Jumppoint {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	size?: 'small' | 'medium' | 'large' | null;
	systems?: JumppointsSystem[] | string[];
}

export interface JumppointsSystem {
	/** @primaryKey */
	id: number;
	jumppoints_id?: Jumppoint | string | null;
	systems_id?: System | string | null;
}

export interface LandingZone {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	content?: string | null;
	planet?: Planet | string | null;
	moon?: Moon | string | null;
}

export interface Language {
	/** @primaryKey */
	code: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	direction?: 'ltr' | 'rtl' | null;
}

export interface LiteratureBook {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	content?: string | null;
	category?: LiteratureCategory | string | null;
	chapter?: number | null;
}

export interface LiteratureCategory {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	content?: string | null;
	author?: string | null;
	protagonist?: string | null;
	banner?: DirectusFile | string | null;
	books?: LiteratureBook[] | string[];
}

export interface Message {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	text?: string | null;
	chat?: Chat | string | null;
}

export interface Moon {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	size?: number | null;
	age?: number | null;
	orbital_period?: number | null;
	distance?: number | null;
	/** @required */
	habitable: boolean;
	/** @required */
	fairchanceact: boolean;
	population?: number | null;
	economy?: number | null;
	danger_level?: number | null;
	content?: string | null;
	planet?: Planet | string | null;
	astronomical_designation?: string | null;
	landing_zones?: LandingZone[] | string[];
	orbit?: MoonsOrbit[] | string[];
}

export interface MoonsOrbit {
	/** @primaryKey */
	id: number;
	moon_id?: Moon | string | null;
	object?: SpaceStation | string | null;
	sort?: number | null;
	collection?: string | null;
}

export interface OneDayInHistory {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	content?: string | null;
	/** @required */
	title: string;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	date?: string | null;
}

export interface Partner {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	url?: string | null;
	logo?: DirectusFile | string | null;
}

export interface PersonalWeaponAttachment {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	store_image?: DirectusFile | string | null;
	name?: string | null;
	slug?: string | null;
	category?: 'sight' | 'barrel' | 'underbarrel' | 'magazine' | null;
	classification?: PersonalWeaponAttachmentsClassification | string | null;
	size?: '1' | '2' | '3' | null;
	weight?: number | null;
	price?: number | null;
	zoom_level?: '1' | '2' | '3' | '4' | '8' | '16' | null;
	/** @required */
	auto_zeroing: boolean;
	zeroing_range?: number | null;
	/** @required */
	rangefinder: boolean;
	content?: string | null;
	statistic?: Array<{ property: 'noise_level' | 'damage' | 'recoil'; value: number }> | null;
	max_rounds?: number | null;
	manufacturer?: Company | string | null;
	gallery?: PersonalWeaponAttachmentsGalleryFile[] | string[];
}

export interface PersonalWeaponAttachmentsClassification {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	classification?: 'sight' | 'barrel' | 'underbarrel' | 'magazine' | null;
	personal_weapon_attachments?: PersonalWeaponAttachment[] | string[];
}

export interface PersonalWeaponAttachmentsGalleryFile {
	/** @primaryKey */
	id: number;
	personal_weapon_attachments_id?: PersonalWeaponAttachment | string | null;
	directus_files_id?: DirectusFile | string | null;
	sort?: number | null;
}

export interface PersonalWeapon {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	store_image?: DirectusFile | string | null;
	manufacturer?: Company | string | null;
	classification?: 'crossbow' | 'grenade_launcher' | 'hmg' | 'lmg' | 'pistol' | 'railgun' | 'rocket_launcher' | 'sniper_rifle' | 'shotgun' | 'smg' | 'assault_rifle' | 'taser' | null;
	damage_type?: 'electrons' | 'ballistic' | 'laser' | 'plasma' | 'explosive' | null;
	fire_modes?: Array<'charge' | 'fully_automatic' | 'single_shot' | 'burst_shot'> | null;
	weight?: number | null;
	calibre?: number | null;
	statistics?: Array<{ property: string; zero_meters: number; 15m: number; 20m: number; 25m: number; 30m: number; 40m: number; 50m: number; 100m: number; 200m: number; 400m: number; 800m: number; 1000m: number }> | null;
	fire_rates?: Array<{ name: string; value: number }> | null;
	muzzle_velocity?: number | null;
	locktime?: number | null;
	content?: string | null;
	max_range?: number | null;
	effective_range?: string | null;
	sight?: PersonalWeaponAttachment | string | null;
	magazine?: PersonalWeaponAttachment | string | null;
}

export interface Planet {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	size?: number | null;
	orbital_period?: number | null;
	age?: number | null;
	distance?: number | null;
	type?: 'terrestrickRock' | 'superEarth' | 'superJupiter' | 'ironPlanet' | 'smogPlanet' | 'desertPlanet' | 'oceanPlanet' | 'lavaPlanet' | 'mesoplanet' | 'protoplanet' | 'dwarfPlanet' | 'gasGiant' | 'gasDwarf' | 'iceGiant' | 'icePlanet' | 'planetoid' | 'planetaryMoon' | 'corelessPlanet' | 'artificial' | 'puffyPlanet' | 'carbonPlanet' | 'chthonianPlanet' | 'roguePlanet' | null;
	/** @required */
	habitable: boolean;
	/** @required */
	fairchanceact: boolean;
	population?: number | null;
	economy?: number | null;
	danger_level?: number | null;
	content?: string | null;
	star_system?: System | string | null;
	astronomical_designation?: string | null;
	landing_zones?: LandingZone[] | string[];
	orbit?: PlanetsOrbit[] | string[];
}

export interface PlanetsOrbit {
	/** @primaryKey */
	id: number;
	planet_id?: Planet | string | null;
	object?: Moon | SpaceStation | Planet | string | null;
	sort?: number | null;
	collection?: string | null;
}

export interface Project {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	description?: string | null;
}

export interface ReleaseNote {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	version: string;
	banner?: DirectusFile | string | null;
	translations?: ReleaseNotesTranslation[] | null;
}

export interface ReleaseNotesTranslation {
	/** @primaryKey */
	id: number;
	release_notes_id?: ReleaseNote | string | null;
	languages_code?: Language | string | null;
	name?: string | null;
	content?: string | null;
}

export interface ShipModule {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	ship?: Ship | string | null;
	name?: string | null;
	slug?: string | null;
	manufacturer?: Company | string | null;
	pledge_price?: number | null;
	price?: number | null;
	production_status?: `flight-ready` | `in-production` | `in-concept` | null;
	description?: string | null;
	gallery?: ShipModulesGallery[] | string[];
}

export interface ShipModulesGallery {
	/** @primaryKey */
	id: number;
	ship_module_id?: ShipModule | string | null;
	directus_file_id?: DirectusFile | string | null;
	sort?: number | null;
}

export interface ShipPaint {
	/** @primaryKey */
	id: number;
	ship?: Ship | string | null;
	name?: string | null;
	slug?: string | null;
	store_image?: DirectusFile | string | null;
}

export interface ShipRating {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	introduction?: string | null;
	ratings?: Array<{ category: 'combat_potential' | 'economic_potential' | 'usage_potential' | `p-p_ratio` | 'conclusion'; grade: 'bad' | 'medium' | 'good' | 'very_good'; reason: string }> | null;
	strengths_and_weaknesses?: Array<{ category: 'strength' | 'weakness'; name: string }> | null;
	ships?: Ship[] | string[];
}

export interface Ship {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	p4k_mode?: boolean | null;
	p4k_id?: string | null;
	p4k_name?: string | null;
	p4k_version?: string | null;
	manufacturer?: Company | string | null;
	store_url?: string | null;
	sales_url?: string | null;
	erkul_id?: string | null;
	fl_id?: string | null;
	pledge_price?: number | null;
	price?: number | null;
	on_sale?: boolean | null;
	production_note?: string | null;
	live_patch?: string | null;
	tank_size_hydrogen?: number | null;
	tank_size_quantum?: number | null;
	crew_min?: number | null;
	crew_max?: string | null;
	speed_max?: number | null;
	speed_scm?: number | null;
	zero_to_scm?: number | null;
	zero_to_max?: number | null;
	scm_to_zero?: number | null;
	max_to_zero?: number | null;
	brochure?: DirectusFile | string | null;
	hologram?: DirectusFile | string | null;
	size_label?: string | null;
	insurance_claim_time?: number | null;
	insurance_expedited_cost?: number | null;
	insurance_expedited_time?: number | null;
	store_image?: DirectusFile | string | null;
	commercial_video_id?: string | null;
	ground?: boolean | null;
	description?: string | null;
	history?: string | null;
	rating?: ShipRating | string | null;
	production_status?: string | null;
	field_overwrite?: Array<'store_image' | 'name' | 'p4k_mode' | 'p4k_name' | 'p4k_version' | 'gallery' | 'paints' | 'brochure' | 'hologram' | 'p4k_id' | 'erkul_id' | 'fl_id' | 'sm_id' | 'manufacturer' | 'store_url' | 'sales_url' | 'on_sale' | 'pledge_price' | 'price' | 'production_status' | 'production_note' | 'live_patch' | 'size' | 'size_label' | 'length' | 'height' | 'beam' | 'mass' | 'crew_min' | 'crew_max' | 'hydrogen_fuel_tanks' | 'quantum_fuel_tanks' | 'speed_max' | 'speed_scm' | 'zero_to_scm' | 'scm_to_zero' | 'zero_to_max' | 'max_to_zero' | 'pitch_max' | 'yaw_max' | 'roll_max' | 'axis_acceleration_x' | 'axis_acceleration_y' | 'axis_acceleration_z' | 'acceleration_main' | 'acceleration_retro' | 'acceleration_vtol' | 'acceleration_maneuvering' | 'insurance_claim_time' | 'insurance_expedited_cost' | 'insurance_expedited_time' | 'classification' | 'focuses' | 'ground' | 'gravlev' | 'pilot_hardpoints' | 'remote_turrets' | 'manned_turrets' | 'shields' | 'power_plants' | 'coolers' | 'quantum_drives' | 'main_thrusters' | 'retro_thrusters' | 'maneuvering_thrusters' | 'vtol_thrusters' | 'commercial_video_id' | 'description' | 'history' | 'rating' | 'loaners' | 'variants' | 'modules'> | null;
	ownable?: boolean | null;
	classification?: 'starter' | 'exploration' | 'cargo' | 'combat' | 'mining' | 'salvage' | 'racing' | 'specialized' | `multi-role` | 'other' | 'personal_transport' | 'support' | 'industrial' | null;
	focuses?: Array<'light_freight' | 'medium_freight' | 'heavy_freight' | 'light_transport' | 'medium_transport' | 'heavy_transport' | 'military_transport' | 'light_data' | 'medium_data' | 'heavy_data' | 'light_refining' | 'medium_refining' | 'heavy_refining' | 'light_salvage' | 'medium_salvage' | 'heavy_salvage' | 'light_mining' | 'medium_mining' | 'heavy_mining' | 'light_repair' | 'medium_repair' | 'heavy_repair' | 'light_refueling' | 'medium_refueling' | 'heavy_refueling' | 'light_construction' | 'medium_construction' | 'heavy_construction' | 'light_science' | 'medium_science' | 'heavy_science' | 'light_carrier' | 'medium_carrier' | 'heavy_carrier' | 'luxury' | 'modular' | 'medical' | 'touring' | 'expedition' | 'exploration' | 'pathfinder' | 'reporting' | 'light_fighter' | 'medium_fighter' | 'heavy_fighter' | 'light_gunship' | 'medium_gunship' | 'heavy_gunship' | 'snub' | 'frigate' | 'destroyer' | 'corvette' | 'recon' | 'bomber' | 'interdicion' | 'dropship' | 'stealth' | 'minelayer' | `e-war` | 'anti_air' | 'ground_combat' | 'tow_ship'> | null;
	pilot_hardpoints?: Array<{ size: number; gimbaled: boolean; name: string; class_name: string; manufacturer: string }> | null;
	remote_turrets?: Array<{ size: number; name: string; class_name: string; manufacturer: string }> | null;
	manned_turrets?: Array<{ size: number; name: string; class_name: string; manufacturer: string }> | null;
	shields?: Array<{ size: number; grade: number; name: string; class_name: string; manufacturer: string }> | null;
	coolers?: Array<{ size: number; grade: number; name: string; class_name: string; manufacturer: string }> | null;
	quantum_drives?: Array<{ size: number; grade: number; name: string; class_name: string; manufacturer: string }> | null;
	power_plants?: Array<{ size: number; grade: number; name: string; class_name: string; manufacturer: string }> | null;
	quantum_fuel_tanks?: Array<{ size: number; capacity: number }> | null;
	hydrogen_fuel_tanks?: Array<{ size: number; capacity: number }> | null;
	main_thrusters?: Array<{ size: number; grade: number; manufacturer: string }> | null;
	retro_thrusters?: Array<{ size: number; grade: number; manufacturer: string }> | null;
	vtol_thrusters?: Array<{ size: number; grade: number; manufacturer: string }> | null;
	maneuvering_thrusters?: Array<{ size: number; grade: number; manufacturer: string }> | null;
	mass?: number | null;
	length?: number | null;
	beam?: number | null;
	height?: number | null;
	gravlev?: boolean | null;
	acceleration_main?: number | null;
	acceleration_retro?: number | null;
	acceleration_vtol?: number | null;
	acceleration_maneuvering?: number | null;
	pitch?: number | null;
	roll?: number | null;
	yaw?: number | null;
	sm_id?: number | null;
	commercial?: DirectusFile | string | null;
	cargo?: number | null;
	starter_ship?: boolean | null;
	size?: 'v' | '1' | '2' | '3' | '4' | '5' | '6' | null;
	user_wishlists?: UserWishlist[] | string[];
	user_hangars?: UserHangar[] | string[];
	commercials?: ShipsCommercial[] | string[];
	gallery?: ShipsGallery[] | string[];
	modules?: ShipModule[] | string[];
	paints?: ShipPaint[] | string[];
	loaners?: ShipsLoaner[] | string[];
	'3d_models'?: ShipsFile[] | string[];
	variants?: ShipsVariant[] | string[];
}

export interface ShipsCommercial {
	/** @primaryKey */
	id: number;
	ship_id?: Ship | string | null;
	commercial_id?: DirectusFile | string | null;
}

export interface ShipsFile {
	/** @primaryKey */
	id: number;
	ships_id?: Ship | string | null;
	directus_files_id?: DirectusFile | string | null;
}

export interface ShipsGallery {
	/** @primaryKey */
	id: number;
	ships_id?: Ship | string | null;
	directus_files_id?: DirectusFile | string | null;
	sort?: number | null;
}

export interface ShipsLoaner {
	/** @primaryKey */
	id: number;
	ship_id?: Ship | string | null;
	loaner_id?: Ship | string | null;
}

export interface ShipsVariant {
	/** @primaryKey */
	id: number;
	ship_id?: Ship | string | null;
	variant_id?: Ship | string | null;
}

export interface SpaceStation {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	banner?: DirectusFile | string | null;
	name?: string | null;
	slug?: string | null;
	content?: string | null;
	type?: 'orbital_station' | 'lagrange_point' | null;
}

export interface SpectrumCategory {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	content?: string | null;
	banner?: DirectusFile | string | null;
	threads?: SpectrumThread[] | string[];
}

export interface SpectrumThread {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	content?: string | null;
	banner?: DirectusFile | string | null;
	description?: string | null;
	category?: SpectrumCategory | string | null;
	chapter?: number | null;
}

export interface Starmap {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	history_introduction?: string | null;
	history?: Array<{ image: string; year: number; title: string; description: string }> | null;
	distances?: string | null;
	jumppoint_connections?: string | null;
	borders?: string | null;
}

export interface Star {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	size?: 'main_sequence' | 'Hypergiant' | 'supergiant' | 'bright_giant' | 'giant' | 'subgiant' | 'dwarf' | 'subdwarf' | null;
	type?: 'black_hole' | 'neutron_star' | 'o' | 'b' | 'a' | 'f' | 'g' | 'k' | 'm' | 'l' | 't' | 'y' | 'r' | 'n' | 's' | null;
	content?: string | null;
}

export interface System {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	name: string;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	starmap_id?: string | null;
	content?: string | null;
	star_type?: 'single' | 'binary' | null;
	star_class?: string | null;
	size?: number | null;
	affiliation?: 'uee' | 'in_development' | 'unclaimed' | 'banu' | 'xian' | 'vanduul' | null;
	discovery_year?: number | null;
	population?: number | null;
	economy?: number | null;
	danger_level?: number | null;
	overview_image?: DirectusFile | string | null;
	starmap_position_left?: number | null;
	starmap_position_top?: number | null;
	tsb?: string | null;
	whisper_in_the_wind?: string | null;
	military_classified?: boolean | null;
	live_status?: boolean | null;
	orbit?: SystemsOrbit[] | string[];
	jumppoints?: JumppointsSystem[] | string[];
	planets?: Planet[] | string[];
}

export interface SystemsOrbit {
	/** @primaryKey */
	id: number;
	system_id?: System | string | null;
	object?: Planet | Moon | Jumppoint | SpaceStation | AsteroidBelt | Star | string | null;
	sort?: number | null;
	collection?: string | null;
}

export interface Task {
	/** @primaryKey */
	id: string;
	status?: 'backlog' | 'ideas' | 'in_concept' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'on_hold' | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	title?: string | null;
	description?: string | null;
	project?: Project | string | null;
	tags?: string[] | null;
	parent_task?: Task | string | null;
	sort?: number | null;
	banner?: DirectusFile | string | null;
	files?: TasksFile[] | string[];
	sub_tasks?: Task[] | string[];
	assigned_to?: TasksDirectusUser[] | string[];
}

export interface TasksDirectusUser {
	/** @primaryKey */
	id: number;
	tasks_id?: Task | string | null;
	directus_users_id?: DirectusUser | string | null;
}

export interface TasksFile {
	/** @primaryKey */
	id: number;
	tasks_id?: Task | string | null;
	directus_files_id?: DirectusFile | string | null;
}

export interface Technology {
	/** @primaryKey */
	id: string;
	status?: 'published' | 'draft' | 'archived';
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	name?: string | null;
	slug?: string | null;
	banner?: DirectusFile | string | null;
	description?: string | null;
	content?: string | null;
	icon?: DirectusFile | string | null;
	/** @required */
	category: 'ship' | 'personal';
}

export interface Test {
	/** @primaryKey */
	id: string;
}

export interface TimelineItem {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	/** @required */
	title: string;
	/** @required */
	category: 'ariscorp_timeline' | 'verse_timeline' | 'one_day_in_history' | 'company_founding' | 'epoch';
	banner?: DirectusFile | string | null;
	description?: string | null;
	old?: string | null;
	old2?: string | null;
	dates?: Array<{ type: 'start' | 'end'; until_now: boolean; year: number; month: number; day: number }> | null;
	old3?: string | null;
	linked_item?: TimelineItemsLinkedItem[] | string[];
}

export interface TimelineItemsLinkedItem {
	/** @primaryKey */
	id: number;
	timeline_items_id?: TimelineItem | string | null;
	item?: System | Company | LiteratureCategory | Fraction | SpectrumCategory | Ship | DirectusUser | SpectrumThread | string | null;
	collection?: string | null;
}

export interface TTAHtmltemplate {
	/** @primaryKey */
	id: number;
	description?: string | null;
	collection?: string | null;
	name?: string | null;
	header?: string | null;
	template?: string | null;
	footer?: string | null;
	format?: string | null;
	orientation?: string | null;
}

export interface Uee {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	banner?: DirectusFile | string | null;
	content?: string | null;
	tabs?: Array<{ title: string; content: string }> | null;
	holidays?: Array<{ name: string; date: string; content: string }> | null;
}

export interface UserHangar {
	/** @primaryKey */
	id: number;
	user_id?: DirectusUser | string | null;
	ship_id?: Ship | string | null;
	name?: string | null;
	name_public?: boolean | null;
	serial?: string | null;
	group?: 'ariscorp' | 'private' | null;
	visibility?: 'public' | 'internal' | 'hidden' | null;
	department?: Department | string | null;
	planned?: boolean | null;
	active_module?: ShipModule | string | null;
	date_created?: string | null;
	deleted?: boolean | null;
	date_updated?: string | null;
	buy_status?: 'pledged' | 'in_game' | 'planned' | null;
}

export interface UserPasswordResetToken {
	/** @primaryKey */
	id: string;
	date_created?: string | null;
	date_updated?: string | null;
	token?: string | null;
	user?: DirectusUser | string;
}

export interface UserWishlist {
	/** @primaryKey */
	id: number;
	user_id?: DirectusUser | string | null;
	ship_id?: Ship | string | null;
}

export interface VerseExkurs {
	/** @primaryKey */
	id: string;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	user_updated?: DirectusUser | string | null;
	date_updated?: string | null;
	content?: string | null;
	ve_links?: Array<{ name: string; link: string; icon: string; description: string }> | null;
	sources?: Array<{ url: string; icon: string }> | null;
}

export interface DirectusAccess {
	/** @primaryKey */
	id: string;
	role?: DirectusRole | string | null;
	user?: DirectusUser | string | null;
	policy?: DirectusPolicy | string;
	sort?: number | null;
}

export interface DirectusActivity {
	/** @primaryKey */
	id: number;
	action?: string;
	user?: DirectusUser | string | null;
	timestamp?: string;
	ip?: string | null;
	user_agent?: string | null;
	collection?: string;
	item?: string;
	origin?: string | null;
	revisions?: DirectusRevision[] | string[];
}

export interface DirectusCollection {
	/** @primaryKey */
	collection: string;
	icon?: string | null;
	note?: string | null;
	display_template?: string | null;
	hidden?: boolean;
	singleton?: boolean;
	translations?: Array<{ language: string; translation: string; singular: string; plural: string }> | null;
	archive_field?: string | null;
	archive_app_filter?: boolean;
	archive_value?: string | null;
	unarchive_value?: string | null;
	sort_field?: string | null;
	accountability?: 'all' | 'activity' | null | null;
	color?: string | null;
	item_duplication_fields?: 'json' | null;
	sort?: number | null;
	group?: DirectusCollection | string | null;
	collapse?: string;
	preview_url?: string | null;
	versioning?: boolean;
}

export interface DirectusComment {
	/** @primaryKey */
	id: string;
	collection?: DirectusCollection | string;
	item?: string;
	comment?: string;
	date_created?: string | null;
	date_updated?: string | null;
	user_created?: DirectusUser | string | null;
	user_updated?: DirectusUser | string | null;
}

export interface DirectusField {
	/** @primaryKey */
	id: number;
	collection?: DirectusCollection | string;
	field?: string;
	special?: string[] | null;
	interface?: string | null;
	options?: 'json' | null;
	display?: string | null;
	display_options?: 'json' | null;
	readonly?: boolean;
	hidden?: boolean;
	sort?: number | null;
	width?: string | null;
	translations?: 'json' | null;
	note?: string | null;
	conditions?: 'json' | null;
	required?: boolean | null;
	group?: DirectusField | string | null;
	validation?: 'json' | null;
	validation_message?: string | null;
}

export interface DirectusFile {
	/** @primaryKey */
	id: string;
	storage?: string;
	filename_disk?: string | null;
	filename_download?: string;
	title?: string | null;
	type?: string | null;
	folder?: DirectusFolder | string | null;
	uploaded_by?: DirectusUser | string | null;
	created_on?: string;
	modified_by?: DirectusUser | string | null;
	modified_on?: string;
	charset?: string | null;
	filesize?: number | null;
	width?: number | null;
	height?: number | null;
	duration?: number | null;
	embed?: string | null;
	description?: string | null;
	location?: string | null;
	tags?: string[] | null;
	metadata?: 'json' | null;
	focal_point_x?: number | null;
	focal_point_y?: number | null;
	tus_id?: string | null;
	tus_data?: 'json' | null;
	uploaded_on?: string | null;
}

export interface DirectusFolder {
	/** @primaryKey */
	id: string;
	name?: string;
	parent?: DirectusFolder | string | null;
}

export interface DirectusMigration {
	/** @primaryKey */
	version: string;
	name?: string;
	timestamp?: string | null;
}

export interface DirectusPermission {
	/** @primaryKey */
	id: number;
	collection?: string;
	action?: string;
	permissions?: 'json' | null;
	validation?: 'json' | null;
	presets?: 'json' | null;
	fields?: string[] | null;
	policy?: DirectusPolicy | string;
}

export interface DirectusPolicy {
	/** @primaryKey */
	id: string;
	/** @required */
	name: string;
	icon?: string;
	description?: string | null;
	ip_access?: string[] | null;
	enforce_tfa?: boolean;
	admin_access?: boolean;
	app_access?: boolean;
	permissions?: DirectusPermission[] | string[];
	users?: DirectusAccess[] | string[];
	roles?: DirectusAccess[] | string[];
}

export interface DirectusPreset {
	/** @primaryKey */
	id: number;
	bookmark?: string | null;
	user?: DirectusUser | string | null;
	role?: DirectusRole | string | null;
	collection?: string | null;
	search?: string | null;
	layout?: string | null;
	layout_query?: 'json' | null;
	layout_options?: 'json' | null;
	refresh_interval?: number | null;
	filter?: 'json' | null;
	icon?: string | null;
	color?: string | null;
}

export interface DirectusRelation {
	/** @primaryKey */
	id: number;
	many_collection?: string;
	many_field?: string;
	one_collection?: string | null;
	one_field?: string | null;
	one_collection_field?: string | null;
	one_allowed_collections?: string[] | null;
	junction_field?: string | null;
	sort_field?: string | null;
	one_deselect_action?: string;
}

export interface DirectusRevision {
	/** @primaryKey */
	id: number;
	activity?: DirectusActivity | string;
	collection?: string;
	item?: string;
	data?: 'json' | null;
	delta?: 'json' | null;
	parent?: DirectusRevision | string | null;
	version?: DirectusVersion | string | null;
}

export interface DirectusRole {
	/** @primaryKey */
	id: string;
	/** @required */
	name: string;
	icon?: string;
	description?: string | null;
	access_level?: number | null;
	label?: string | null;
	parent?: DirectusRole | string | null;
	children?: DirectusRole[] | string[];
	policies?: DirectusAccess[] | string[];
	users?: DirectusUser[] | string[];
}

export interface DirectusSession {
	/** @primaryKey */
	token: string;
	user?: DirectusUser | string | null;
	expires?: string;
	ip?: string | null;
	user_agent?: string | null;
	share?: DirectusShare | string | null;
	origin?: string | null;
	next_token?: string | null;
}

export interface DirectusSettings {
	/** @primaryKey */
	id: number;
	project_name?: string;
	project_url?: string | null;
	project_color?: string;
	project_logo?: DirectusFile | string | null;
	public_foreground?: DirectusFile | string | null;
	public_background?: DirectusFile | string | null;
	public_note?: string | null;
	auth_login_attempts?: number | null;
	auth_password_policy?: null | `/^.{8,}$/` | `/(?=^.{8,}$)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{';'?>.<,])(?!.*\\s).*$/` | null;
	storage_asset_transform?: 'all' | 'none' | 'presets' | null;
	storage_asset_presets?: Array<{ key: string; fit: 'contain' | 'cover' | 'inside' | 'outside'; width: number; height: number; quality: number; withoutEnlargement: boolean; format: 'auto' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'avif'; transforms: 'json' }> | null;
	custom_css?: string | null;
	storage_default_folder?: DirectusFolder | string | null;
	basemaps?: Array<{ name: string; type: 'raster' | 'tile' | 'style'; url: string; tileSize: number; attribution: string }> | null;
	mapbox_key?: string | null;
	module_bar?: 'json' | null;
	project_descriptor?: string | null;
	default_language?: string;
	custom_aspect_ratios?: Array<{ text: string; value: number }> | null;
	public_favicon?: DirectusFile | string | null;
	default_appearance?: 'auto' | 'light' | 'dark';
	default_theme_light?: string | null;
	theme_light_overrides?: 'json' | null;
	default_theme_dark?: string | null;
	theme_dark_overrides?: 'json' | null;
	report_error_url?: string | null;
	report_bug_url?: string | null;
	report_feature_url?: string | null;
	public_registration?: boolean;
	public_registration_verify_email?: boolean;
	public_registration_role?: DirectusRole | string | null;
	public_registration_email_filter?: 'json' | null;
	flow_manager_categories?: Record<string, any> | null;
	command_palette_settings?: Record<string, any> | null;
	TTA_KEY?: string | null;
	visual_editor_urls?: Array<{ url: string }> | null;
	accepted_terms?: boolean | null;
	project_id?: string | null;
	collaborative_editing_settings?: Record<string, any> | null;
	mcp_enabled?: boolean;
	mcp_allow_deletes?: boolean;
	mcp_prompts_collection?: string | null;
	mcp_system_prompt_enabled?: boolean;
	mcp_system_prompt?: string | null;
}

export interface DirectusUser {
	/** @primaryKey */
	id: string;
	first_name?: string | null;
	last_name?: string | null;
	email?: string | null;
	password?: string | null;
	location?: string | null;
	title?: string | null;
	description?: string | null;
	tags?: string[] | null;
	avatar?: DirectusFile | string | null;
	language?: string | null;
	tfa_secret?: string | null;
	status?: 'draft' | 'invited' | 'unverified' | 'active' | 'suspended' | 'archived';
	role?: DirectusRole | string | null;
	token?: string | null;
	last_access?: string | null;
	last_page?: string | null;
	provider?: string;
	external_identifier?: string | null;
	auth_data?: 'json' | null;
	email_notifications?: boolean | null;
	appearance?: null | 'auto' | 'light' | 'dark' | null;
	theme_dark?: string | null;
	theme_light?: string | null;
	theme_light_overrides?: 'json' | null;
	theme_dark_overrides?: 'json' | null;
	slug?: string | null;
	temporary_password?: boolean | null;
	rsi_handle?: string | null;
	discord_name?: string | null;
	contact_email?: string | null;
	roles?: 'recruitment' | 'marketing_and_press' | 'content_writer' | null;
	sex?: 'male' | 'female' | null;
	department?: Department | string | null;
	leading_department?: Department | string | null;
	head_of_department?: boolean | null;
	birthplace?: LandingZone | string | null;
	current_residence?: LandingZone | string | null;
	citizen?: boolean | null;
	citizen_reason?: 'military' | 'special_education' | 'social_commitment' | null;
	duty_state?: boolean | null;
	duty_period?: string | null;
	duty_division?: string | null;
	duty_end?: 'honorable' | 'dishonorable' | null;
	hair_color?: string | null;
	eye_color?: string | null;
	height?: number | null;
	weight?: number | null;
	hobbies?: string | null;
	habits?: string | null;
	talents?: string | null;
	tics?: string | null;
	activities?: string | null;
	mysterious_things?: string | null;
	character_trait?: string | null;
	fears?: string | null;
	books?: string | null;
	music?: string | null;
	movies?: string | null;
	colors?: string | null;
	clothing?: string | null;
	food?: string | null;
	drink?: string | null;
	alcohol?: string | null;
	loves?: string | null;
	hates?: string | null;
	medical_informations?: string | null;
	biography?: string | null;
	education_name?: string | null;
	education_period?: string | null;
	discord_id?: string | null;
	education_state?: boolean | null;
	birthdate?: string | null;
	date_created?: string | null;
	social_state?: boolean | null;
	onboarded?: boolean | null;
	onboardings?: 'hangar' | 'profile' | 'home' | 'fleet' | 'employees' | 'admin' | null;
	user_preferences?: Array<{ key: string; value: string }> | null;
	api_account?: boolean | null;
	chats?: Chat | string | null;
	hidden?: boolean | null;
	middle_name?: string | null;
	hobbies_list?: Array<{ item: string; sort: number }> | null;
	talents_list?: Array<{ item: string; sort: number }> | null;
	tics_list?: Array<{ item: string; sort: number }> | null;
	activities_list?: Array<{ item: string; sort: number }> | null;
	mysterious_list?: Array<{ item: string; sort: number }> | null;
	character_trait_list?: Array<{ item: string; sort: number }> | null;
	fears_list?: Array<{ item: string; sort: number }> | null;
	books_list?: Array<{ item: string; sort: number }> | null;
	music_list?: Array<{ item: string; sort: number }> | null;
	movies_list?: Array<{ item: string; sort: number }> | null;
	colors_list?: Array<{ item: string; sort: number }> | null;
	clothing_list?: Array<{ item: string; sort: number }> | null;
	food_list?: Array<{ item: string; sort: number }> | null;
	drink_list?: Array<{ item: string; sort: number }> | null;
	alcohol_list?: Array<{ item: string; sort: number }> | null;
	loves_list?: Array<{ item: string; sort: number }> | null;
	hates_list?: Array<{ item: string; sort: number }> | null;
	habits_list?: Array<{ item: string; sort: number }> | null;
	education_place?: string | null;
	duty_from_month?: number | null;
	duty_from_year?: number | null;
	duty_to_month?: number | null;
	duty_to_year?: number | null;
	education_from_month?: number | null;
	education_from_year?: number | null;
	education_to_month?: number | null;
	education_to_year?: number | null;
	duty_dismissal_reason?: string | null;
	primary_department?: Department | string | null;
	secondary_department?: Department | string | null;
	date_updated?: string | null;
	text_direction?: string;
	date_archived?: string | null;
	hangar_items?: UserHangar[] | string[];
	wishlist_items?: UserWishlist[] | string[];
	password_reset_tokens?: UserPasswordResetToken[] | string[];
	assigned_tasks?: TasksDirectusUser[] | string[];
	policies?: DirectusAccess[] | string[];
}

export interface DirectusWebhook {
	/** @primaryKey */
	id: number;
	name?: string;
	method?: null;
	url?: string;
	status?: 'active' | 'inactive';
	data?: boolean;
	actions?: 'create' | 'update' | 'delete';
	collections?: string[];
	headers?: Array<{ header: string; value: string }> | null;
	was_active_before_deprecation?: boolean;
	migrated_flow?: DirectusFlow | string | null;
}

export interface DirectusDashboard {
	/** @primaryKey */
	id: string;
	name?: string;
	icon?: string;
	note?: string | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
	color?: string | null;
	panels?: DirectusPanel[] | string[];
}

export interface DirectusPanel {
	/** @primaryKey */
	id: string;
	dashboard?: DirectusDashboard | string;
	name?: string | null;
	icon?: string | null;
	color?: string | null;
	show_header?: boolean;
	note?: string | null;
	type?: string;
	position_x?: number;
	position_y?: number;
	width?: number;
	height?: number;
	options?: 'json' | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
}

export interface DirectusNotification {
	/** @primaryKey */
	id: number;
	timestamp?: string | null;
	status?: string | null;
	recipient?: DirectusUser | string;
	sender?: DirectusUser | string | null;
	subject?: string;
	message?: string | null;
	collection?: string | null;
	item?: string | null;
}

export interface DirectusShare {
	/** @primaryKey */
	id: string;
	name?: string | null;
	collection?: DirectusCollection | string;
	item?: string;
	role?: DirectusRole | string | null;
	password?: string | null;
	user_created?: DirectusUser | string | null;
	date_created?: string | null;
	date_start?: string | null;
	date_end?: string | null;
	times_used?: number | null;
	max_uses?: number | null;
}

export interface DirectusFlow {
	/** @primaryKey */
	id: string;
	name?: string;
	icon?: string | null;
	color?: string | null;
	description?: string | null;
	status?: string;
	trigger?: string | null;
	accountability?: string | null;
	options?: 'json' | null;
	operation?: DirectusOperation | string | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
	flow_manager_category?: string | null;
	flow_manager_order?: number | null;
	flow_manager_last_run_at?: string | null;
	flow_manager_run_counter?: number | null;
	operations?: DirectusOperation[] | string[];
}

export interface DirectusOperation {
	/** @primaryKey */
	id: string;
	name?: string | null;
	key?: string;
	type?: string;
	position_x?: number;
	position_y?: number;
	options?: 'json' | null;
	resolve?: DirectusOperation | string | null;
	reject?: DirectusOperation | string | null;
	flow?: DirectusFlow | string;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
}

export interface DirectusTranslation {
	/** @primaryKey */
	id: string;
	/** @required */
	language: string;
	/** @required */
	key: string;
	/** @required */
	value: string;
}

export interface DirectusVersion {
	/** @primaryKey */
	id: string;
	key?: string;
	name?: string | null;
	collection?: DirectusCollection | string;
	item?: string;
	hash?: string | null;
	date_created?: string | null;
	date_updated?: string | null;
	user_created?: DirectusUser | string | null;
	user_updated?: DirectusUser | string | null;
	delta?: 'json' | null;
}

export interface DirectusExtension {
	folder?: string;
	enabled?: boolean;
	/** @primaryKey */
	id: string;
	source?: string;
	bundle?: string | null;
}

export interface DirectusSyncIdMap {
	/** @primaryKey */
	id: number;
	table?: string;
	sync_id?: string;
	local_id?: string;
	created_at?: string | null;
}

export interface Schema {
	aliens: Alien[];
	ams_dashboard: AmsDashboard;
	ariscorp_events: AriscorpEvent[];
	ariscorp_events_items: AriscorpEventsItem[];
	asteroid_belts: AsteroidBelt[];
	bingo_collections: BingoCollection[];
	bingo_games: BingoGame[];
	chats: Chat[];
	chats_users: ChatsUser[];
	comm_link_channels: CommLinkChannel[];
	comm_links: CommLink[];
	companies: Company[];
	companies_headquarter: CompaniesHeadquarter[];
	company_categories: CompanyCategory[];
	credits: Credits;
	departments: Department[];
	departments_files: DepartmentsFile[];
	fauna: Fauna[];
	fauna_files: FaunaFile[];
	flora: Flora[];
	flora_index: FloraIndex;
	footer: Footer;
	footer_translations: FooterTranslation[];
	fraction_categories: FractionCategory[];
	fractions: Fraction[];
	global_data: GlobalData;
	home: Home;
	jumppoints: Jumppoint[];
	jumppoints_systems: JumppointsSystem[];
	landing_zones: LandingZone[];
	languages: Language[];
	literature_books: LiteratureBook[];
	literature_categories: LiteratureCategory[];
	messages: Message[];
	moons: Moon[];
	moons_orbit: MoonsOrbit[];
	one_day_in_history: OneDayInHistory[];
	partners: Partner[];
	personal_weapon_attachments: PersonalWeaponAttachment[];
	personal_weapon_attachments_classifications: PersonalWeaponAttachmentsClassification[];
	personal_weapon_attachments_gallery_files: PersonalWeaponAttachmentsGalleryFile[];
	personal_weapons: PersonalWeapon[];
	planets: Planet[];
	planets_orbit: PlanetsOrbit[];
	projects: Project[];
	release_notes: ReleaseNote[];
	release_notes_translations: ReleaseNotesTranslation[];
	ship_modules: ShipModule[];
	ship_modules_gallery: ShipModulesGallery[];
	ship_paints: ShipPaint[];
	ship_ratings: ShipRating[];
	ships: Ship[];
	ships_commercials: ShipsCommercial[];
	ships_files: ShipsFile[];
	ships_gallery: ShipsGallery[];
	ships_loaners: ShipsLoaner[];
	ships_variants: ShipsVariant[];
	space_stations: SpaceStation[];
	spectrum_categories: SpectrumCategory[];
	spectrum_threads: SpectrumThread[];
	starmap: Starmap;
	stars: Star[];
	systems: System[];
	systems_orbit: SystemsOrbit[];
	tasks: Task[];
	tasks_directus_users: TasksDirectusUser[];
	tasks_files: TasksFile[];
	technologies: Technology[];
	test: Test[];
	timeline_items: TimelineItem[];
	timeline_items_linked_item: TimelineItemsLinkedItem[];
	TTA_htmltemplates: TTAHtmltemplate[];
	uee: Uee;
	user_hangars: UserHangar[];
	user_password_reset_tokens: UserPasswordResetToken[];
	user_wishlists: UserWishlist[];
	verse_exkurs: VerseExkurs;
	directus_access: DirectusAccess[];
	directus_activity: DirectusActivity[];
	directus_collections: DirectusCollection[];
	directus_comments: DirectusComment[];
	directus_fields: DirectusField[];
	directus_files: DirectusFile[];
	directus_folders: DirectusFolder[];
	directus_migrations: DirectusMigration[];
	directus_permissions: DirectusPermission[];
	directus_policies: DirectusPolicy[];
	directus_presets: DirectusPreset[];
	directus_relations: DirectusRelation[];
	directus_revisions: DirectusRevision[];
	directus_roles: DirectusRole[];
	directus_sessions: DirectusSession[];
	directus_settings: DirectusSettings;
	directus_users: DirectusUser[];
	directus_webhooks: DirectusWebhook[];
	directus_dashboards: DirectusDashboard[];
	directus_panels: DirectusPanel[];
	directus_notifications: DirectusNotification[];
	directus_shares: DirectusShare[];
	directus_flows: DirectusFlow[];
	directus_operations: DirectusOperation[];
	directus_translations: DirectusTranslation[];
	directus_versions: DirectusVersion[];
	directus_extensions: DirectusExtension[];
	directus_sync_id_map: DirectusSyncIdMap[];
}

export enum CollectionNames {
	aliens = 'aliens',
	ams_dashboard = 'ams_dashboard',
	ariscorp_events = 'ariscorp_events',
	ariscorp_events_items = 'ariscorp_events_items',
	asteroid_belts = 'asteroid_belts',
	bingo_collections = 'bingo_collections',
	bingo_games = 'bingo_games',
	chats = 'chats',
	chats_users = 'chats_users',
	comm_link_channels = 'comm_link_channels',
	comm_links = 'comm_links',
	companies = 'companies',
	companies_headquarter = 'companies_headquarter',
	company_categories = 'company_categories',
	credits = 'credits',
	departments = 'departments',
	departments_files = 'departments_files',
	fauna = 'fauna',
	fauna_files = 'fauna_files',
	flora = 'flora',
	flora_index = 'flora_index',
	footer = 'footer',
	footer_translations = 'footer_translations',
	fraction_categories = 'fraction_categories',
	fractions = 'fractions',
	global_data = 'global_data',
	home = 'home',
	jumppoints = 'jumppoints',
	jumppoints_systems = 'jumppoints_systems',
	landing_zones = 'landing_zones',
	languages = 'languages',
	literature_books = 'literature_books',
	literature_categories = 'literature_categories',
	messages = 'messages',
	moons = 'moons',
	moons_orbit = 'moons_orbit',
	one_day_in_history = 'one_day_in_history',
	partners = 'partners',
	personal_weapon_attachments = 'personal_weapon_attachments',
	personal_weapon_attachments_classifications = 'personal_weapon_attachments_classifications',
	personal_weapon_attachments_gallery_files = 'personal_weapon_attachments_gallery_files',
	personal_weapons = 'personal_weapons',
	planets = 'planets',
	planets_orbit = 'planets_orbit',
	projects = 'projects',
	release_notes = 'release_notes',
	release_notes_translations = 'release_notes_translations',
	ship_modules = 'ship_modules',
	ship_modules_gallery = 'ship_modules_gallery',
	ship_paints = 'ship_paints',
	ship_ratings = 'ship_ratings',
	ships = 'ships',
	ships_commercials = 'ships_commercials',
	ships_files = 'ships_files',
	ships_gallery = 'ships_gallery',
	ships_loaners = 'ships_loaners',
	ships_variants = 'ships_variants',
	space_stations = 'space_stations',
	spectrum_categories = 'spectrum_categories',
	spectrum_threads = 'spectrum_threads',
	starmap = 'starmap',
	stars = 'stars',
	systems = 'systems',
	systems_orbit = 'systems_orbit',
	tasks = 'tasks',
	tasks_directus_users = 'tasks_directus_users',
	tasks_files = 'tasks_files',
	technologies = 'technologies',
	test = 'test',
	timeline_items = 'timeline_items',
	timeline_items_linked_item = 'timeline_items_linked_item',
	TTA_htmltemplates = 'TTA_htmltemplates',
	uee = 'uee',
	user_hangars = 'user_hangars',
	user_password_reset_tokens = 'user_password_reset_tokens',
	user_wishlists = 'user_wishlists',
	verse_exkurs = 'verse_exkurs',
	directus_access = 'directus_access',
	directus_activity = 'directus_activity',
	directus_collections = 'directus_collections',
	directus_comments = 'directus_comments',
	directus_fields = 'directus_fields',
	directus_files = 'directus_files',
	directus_folders = 'directus_folders',
	directus_migrations = 'directus_migrations',
	directus_permissions = 'directus_permissions',
	directus_policies = 'directus_policies',
	directus_presets = 'directus_presets',
	directus_relations = 'directus_relations',
	directus_revisions = 'directus_revisions',
	directus_roles = 'directus_roles',
	directus_sessions = 'directus_sessions',
	directus_settings = 'directus_settings',
	directus_users = 'directus_users',
	directus_webhooks = 'directus_webhooks',
	directus_dashboards = 'directus_dashboards',
	directus_panels = 'directus_panels',
	directus_notifications = 'directus_notifications',
	directus_shares = 'directus_shares',
	directus_flows = 'directus_flows',
	directus_operations = 'directus_operations',
	directus_translations = 'directus_translations',
	directus_versions = 'directus_versions',
	directus_extensions = 'directus_extensions',
	directus_sync_id_map = 'directus_sync_id_map'
}