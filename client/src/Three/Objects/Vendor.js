import * as THREE from "three"

import GraphQL from "../../Server/graphQL"

class Vendor {
  constructor(app) {
    this.app = app

    this.ready = false
    this.vendors = null
    this.vector3 = new THREE.Vector3()
    this.vector3b = new THREE.Vector3()

    this.init = this.init.bind(this)
  }

  async init(callback = null) {
    this.getVendorMarkers()

    this.ready = true

    if (callback) {
      callback()
    }
  }

  async getVendorMarkers() {
    this.vendorMarkers = await GraphQL.markers.getMarkers("vendor")
    if (!this.vendorMarkers) return

    for (let i = 0; i < this.vendorMarkers.length; i++) {
      const vendorPosition = this.vendorMarkers[i].position

      const name = this.vendorMarkers[i].props.name
      const vendor = {
        name,
        items: this.vendorMarkers[i].markerItems.nodes.map(
          ({ item: { id, name, price } }) => ({
            id,
            name,
            price,
          })
        ),
        purchaseItemTypes: this.vendorMarkers[i].props.purchase_item_types,
      }

      console.log(vendor)

      const height = 10
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, height, 32)
      const material = new THREE.MeshBasicMaterial({ color: 0x33ff33 })
      const cylinder = new THREE.Mesh(geometry, material)
      cylinder.position.set(vendorPosition.x, height / 2, vendorPosition.z)
      this.app.scene.add(cylinder)
    }
  }

  update(delta) {
    //
  }
}

export { Vendor }
