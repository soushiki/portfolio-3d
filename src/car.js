import * as THREE from 'three';

// Arcade car: a dynamic box that can only spin around Y, driven by setting
// its velocity each physics step. Simple to tune and impossible to flip,
// while still shoving props around through normal collisions.
const MAX_SPEED = 17;
const MAX_REVERSE = 7;
const ACCEL = 22;
const BRAKE = 45;
const COAST = 8;
const TURN_RATE = 2.4;
const GRIP = 0.0008; // fraction of sideways speed left after one second
const HALF = { x: 0.85, y: 0.45, z: 1.55 };

const moveTowards = (value, target, step) =>
  value < target ? Math.min(value + step, target) : Math.max(value - step, target);

export function createCar({ scene, physics, RAPIER, quality, spawn }) {
  const group = new THREE.Group();
  const mat = (color, extra) =>
    quality.low
      ? new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra })
      : new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.6, ...extra });
  const cast = (m) => {
    m.castShadow = quality.shadows;
    return m;
  };

  // The chassis is a child so it can lean without moving the physics body.
  const chassis = new THREE.Group();
  group.add(chassis);
  const body = cast(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 3.1), mat('#22223B')));
  body.position.y = 0.05;
  chassis.add(body);
  const cabin = cast(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 1.5), mat('#F2E9E4')));
  cabin.position.set(0, 0.6, -0.3);
  chassis.add(cabin);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 3.12), mat('#C9ADA7'));
  stripe.position.set(0, 0.335, 0);
  chassis.add(stripe);
  const lightGeo = new THREE.BoxGeometry(0.35, 0.18, 0.05);
  const headMat = new THREE.MeshBasicMaterial({ color: '#FFF8F0' });
  const tailMat = new THREE.MeshBasicMaterial({ color: '#C9ADA7' });
  for (const side of [-1, 1]) {
    const head = new THREE.Mesh(lightGeo, headMat);
    head.position.set(side * 0.55, 0.1, 1.56);
    const tail = new THREE.Mesh(lightGeo, tailMat);
    tail.position.set(side * 0.55, 0.1, -1.56);
    chassis.add(head, tail);
  }

  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = mat('#1a1a2e');
  const hubMat = mat('#9A8C98');
  const hubGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.34, 8);
  hubGeo.rotateZ(Math.PI / 2);
  const wheels = [];
  for (const [x, z, front] of [[-0.85, 1.0, true], [0.85, 1.0, true], [-0.85, -1.0, false], [0.85, -1.0, false]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, -0.1, z);
    const spin = new THREE.Group();
    spin.add(cast(new THREE.Mesh(wheelGeo, wheelMat)), new THREE.Mesh(hubGeo, hubMat));
    pivot.add(spin);
    group.add(pivot);
    wheels.push({ pivot, spin, front });
  }
  scene.add(group);

  const rb = physics.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(spawn.x, HALF.y + 0.05, spawn.z)
      .enabledRotations(false, true, false)
      .setCcdEnabled(true)
      .setCanSleep(false),
  );
  physics.createCollider(
    RAPIER.ColliderDesc.cuboid(HALF.x, HALF.y, HALF.z).setDensity(2.2).setFriction(0.1).setRestitution(0.05),
    rb,
  );

  let speed = 0;
  let steer = 0;
  let wheelRoll = 0;
  const forward = new THREE.Vector3();

  const yawOf = (r) => 2 * Math.atan2(r.y, r.w);

  return {
    group,
    body: rb,
    get speed() {
      return speed;
    },
    get yaw() {
      return yawOf(rb.rotation());
    },

    step(input, dt) {
      const yaw = yawOf(rb.rotation());
      const fx = Math.sin(yaw);
      const fz = Math.cos(yaw);
      const v = rb.linvel();
      // Read the real forward speed back, so walls and crates slow us down.
      speed = v.x * fx + v.z * fz;
      const latX = v.x - fx * speed;
      const latZ = v.z - fz * speed;

      const throttle = input.forward - input.back;
      let target = throttle > 0 ? MAX_SPEED * throttle : throttle < 0 ? -MAX_REVERSE : 0;
      let rate = throttle === 0 ? COAST : Math.sign(target) !== Math.sign(speed) && Math.abs(speed) > 0.5 ? BRAKE : ACCEL;
      if (input.brake) {
        target = 0;
        rate = BRAKE;
      }
      speed = moveTowards(speed, target, rate * dt);

      const grip = Math.pow(GRIP, dt);
      rb.setLinvel({ x: fx * speed + latX * grip, y: v.y, z: fz * speed + latZ * grip }, true);

      steer = moveTowards(steer, input.right - input.left, dt * 6);
      const turnFactor = Math.max(-1, Math.min(1, speed / 5));
      rb.setAngvel({ x: 0, y: -steer * TURN_RATE * turnFactor, z: 0 }, true);
    },

    // Copy physics to the meshes and animate wheels and body lean.
    sync(dt) {
      const p = rb.translation();
      const r = rb.rotation();
      group.position.set(p.x, p.y, p.z);
      group.quaternion.set(r.x, r.y, r.z, r.w);
      wheelRoll += (speed * dt) / 0.38;
      for (const w of wheels) {
        w.spin.rotation.x = wheelRoll;
        if (w.front) w.pivot.rotation.y = -steer * 0.45;
      }
      const lean = THREE.MathUtils.clamp(steer * speed * 0.006, -0.08, 0.08);
      chassis.rotation.z = THREE.MathUtils.lerp(chassis.rotation.z, lean, 0.15);
      forward.set(Math.sin(yawOf(r)), 0, Math.cos(yawOf(r)));
    },

    forward,

    reset(x = spawn.x, z = spawn.z, yaw = spawn.yaw) {
      rb.setTranslation({ x, y: HALF.y + 0.3, z }, true);
      rb.setRotation({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
      speed = 0;
      steer = 0;
    },
  };
}
