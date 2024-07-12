export default function transformUtilStoreImage(obj: any, image_property: string, property_name?: string = 'store_image') {
	return {
		...(obj[image_property] && { [property_name]: obj[image_property].id || obj[image_property] }),
		...(obj[image_property]?.id && {
			[property_name + '_properties']: {
				width: obj[image_property].width,
				height: obj[image_property].height,
				focal_point_x: obj[image_property].focal_point_x,
				focal_point_y: obj[image_property].focal_point_y,
				object_position: obj[image_property].focal_point_x && obj[image_property].focal_point_y ? `${(obj[image_property].focal_point_x / obj[image_property].width) * 100}% ${(obj[image_property].focal_point_y / obj[image_property].height) * 100}%` : 'center',
			},
		}),
	}
}
