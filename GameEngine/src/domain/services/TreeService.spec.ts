import { Tree } from "../models/Tree";
import { Species } from "../models/Species";
import { Exposure } from "../models/Exposure";
import { TreeService } from "./TreeService";

describe('TreeService', () => {
  it('should get the correct tree by UUID', () => {
    // Arrange
    const trees: Tree[] = [
      { id: '1', birth: new Date('2020-01-01'), species: Species.OAK, exposure: Exposure.SUNNY, carbonStorageCapacity: 100 },
      { id: '2', birth: new Date('2019-05-15'), species: Species.ASH, exposure: Exposure.MID_SHADOW, carbonStorageCapacity: 150 }
    ];
    const repoMock = {
      findAll: jest.fn().mockReturnValue(trees),
      insert: jest.fn()
    };
    const treeService = new TreeService(repoMock);

    // Act
    const tree = treeService.get('2');

    // Assert
    expect(tree).toEqual(trees[1]);
    expect(repoMock.findAll).toHaveBeenCalled();
  });
});