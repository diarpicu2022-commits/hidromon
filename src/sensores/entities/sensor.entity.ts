import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Zona } from "../../zonas/entities/zona.entity";

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
}
