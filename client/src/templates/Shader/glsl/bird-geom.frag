
varying vec4 vertex_color;
varying float zcoordi;

void main() {
    float z = 0.2 + ( 1000. - zcoordi ) / 1000. * vertex_color.x;
    gl_FragColor = vec4( z, z, z, 1. );
}