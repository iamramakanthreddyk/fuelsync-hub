import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import Link from 'next/link';

interface Station {
  id: number;
  name: string;
}

interface Props {
  stations: Station[];
}

const StationList: React.FC<Props> = ({ stations }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {stations.map((s) => (
        <TableRow key={s.id}>
          <TableCell>{s.name}</TableCell>
          <TableCell align="right">
            <Link href={`/stations/${s.id}/edit`} passHref>
              <Button>Edit</Button>
            </Link>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default StationList;
