// Copyright (C) 2018 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.gerrit.entities.converter;

import com.google.errorprone.annotations.Immutable;
import com.google.gerrit.entities.LabelId;
import com.google.gerrit.proto.Entities;
import com.google.protobuf.Parser;

@Immutable
public enum LabelIdProtoConverter implements SafeProtoConverter<Entities.LabelId, LabelId> {
  INSTANCE;

  @Override
  public Entities.LabelId toProto(LabelId labelId) {
    return Entities.LabelId.newBuilder().setId(labelId.get()).build();
  }

  @Override
  public LabelId fromProto(Entities.LabelId proto) {
    return LabelId.create(proto.getId());
  }

  @Override
  public Parser<Entities.LabelId> getParser() {
    return Entities.LabelId.parser();
  }

  @Override
  public Class<Entities.LabelId> getProtoClass() {
    return Entities.LabelId.class;
  }

  @Override
  public Class<LabelId> getEntityClass() {
    return LabelId.class;
  }
}
