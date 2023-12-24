package com.greenhouse.service.impl;

import com.greenhouse.model.Attribute_Value;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.repository.AttributeValueRepository;
import com.greenhouse.service.AttributeValueService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AttributeValueServiceImpl implements AttributeValueService {

    @Autowired
    AttributeValueRepository attributeValueRepository;

    @Override
    public List<Attribute_Value> findAll() {
        return attributeValueRepository.findAll();
    }

    @Override
    public Attribute_Value findById(Integer id) {
        return attributeValueRepository.findById(id).orElse(null);
    }

    @Override
    public Attribute_Value add(Attribute_Value entity) {
        return attributeValueRepository.save(entity);
    }

    @Override
    public Attribute_Value update(Attribute_Value entity) {
        return attributeValueRepository.save(entity);
    }

    @Override
    public void delete(Integer id) {
        attributeValueRepository.deleteById(id);
    }

}
