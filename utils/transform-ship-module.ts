export default function (obj: any) {
	const getShip = () => (obj.ship ? transformShip(obj.ship) : null)
	const getManufacturer = () => (obj.manufacturer ? transformCompany(obj.manufacturer) : null)

	return {
		...(obj.id && { id: obj.id }),
		...(obj.gallery && { store_image: obj.gallery[0]?.directus_file_id }),
		...(obj.gallery && { gallery: obj.gallery.map((e: any) => e.directus_file_id) }),
		...(obj.name && { name: obj.name }),
		...(obj.slug && { slug: obj.slug }),
		...(obj.ship && { ship: getShip() }),
		...(obj.pledgePrice && { pledgePrice: obj.pledgePrice }),
		...(obj.price && { price: obj.price }),
		...(obj.production_status && {
			production_status:
        obj.production_status === 'flight-ready'
        	? 'Flugfertig'
        	: obj.production_status === 'in-production'
        		? 'In Produktion'
        		: 'In Konzept',
			production_status_value: obj.production_status,
		}),
		...(obj.manufacturer && { manufacturer: getManufacturer() }),
		...(obj.description && { description: obj.description }),
	}
}
