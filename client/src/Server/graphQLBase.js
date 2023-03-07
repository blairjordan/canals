class GraphQLBase {
    constructor(client) {
        //right now it is kind of redundant, but put it here to help extend things later.
        this.client = client;
    }
}
export {GraphQLBase}