import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Sensor } from "../../sensores/entities/sensor.entity";
import { Alerta } from "../../alertas/entities/alerta.entity";

@Entity({
    name: "lecturas",
})
export class Lectura {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "float" })
    valor: number;

    @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    fecha: Date;

    @CreateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "created_at"
        })
    createdAt: Date;

    @UpdateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "updated_at"
        })
    updatedAt: Date;

    @ManyToOne(() => Sensor, (sensor) => sensor.lecturas, { nullable: false })
    @JoinColumn({ name: "sensor_id" })
    sensor: Sensor;

    @OneToMany(() => Alerta, (alerta) => alerta.lectura)
    alertas: Alerta[];
}
