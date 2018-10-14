use nalgebra::Vector3;
use std::cmp::max;

#[derive(Eq, PartialEq)]
struct Hex {
    coords: Vector3<i32>,
}

impl Hex {
    fn new(q: i32, r: i32) -> Self {
        Hex {
            coords: Vector3::new(q, r, -1 * q - r),
        }
    }

    fn distance_from(&self, other: &Hex) -> i32 {
        let distance = self.coords - other.coords;
        max(max(distance.x.abs(), distance.y.abs()), distance.z.abs())
    }
}

fn main() {
    let hex1 = Hex::new(-3, 0);
    let hex2 = Hex::new(-2, 1);
    let distance = hex1.distance_from(&hex2);
    println!("distance: {}", distance);
}
