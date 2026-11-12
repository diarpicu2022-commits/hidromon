import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FichaTecnica } from "./ficha-tecnica.entity";
import { Zona } from "../../zonas/entities/zona.entity";
import { Lectura } from "../../lecturas/entities/lectura.entity";

@Entity({
    name: "sensores",
})
export class Sensor {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 50, unique: true })
    codigo: string;

    @Column({ type: "varchar", length: 50 })
    tipo: string;

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

    @ManyToOne(() => Zona, (zona) => zona.sensores, { nullable: false })
    @JoinColumn({ name: "zona_id" })
    zona: Zona;

    @OneToMany(() => Lectura, (lectura) => lectura.sensor)
    lecturas: Lectura[];

    // nullable en la base solo por los sensores creados antes de esta relación (ver README).
    @OneToOne(() => FichaTecnica, { nullable: true, cascade: true })
    @JoinColumn({ name: "ficha_tecnica_id" })
    fichaTecnica: FichaTecnica | null;
}
